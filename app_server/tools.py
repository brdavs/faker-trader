import dateutil
from app_server.config import *
from app_server.models import *
from websocket import create_connection
import dateutil.parser

db = SqliteDatabase(DATABASE)

def wsSend(message):
    ws = create_connection(WEBSOCKETS_URI, timeout=2)
    ws.send(message)
    ws.close()


def datetime_adapter(obj, request):
    return obj.isoformat()

def last_price():
    return Price.select().order_by(Price.datetime.desc()).get()


def handle_order(order):
    # Set up dates on this new order
    order.open = dateutil.parser.parse(order.open) if order.open else None
    order.close =  dateutil.parser.parse(order.close) if order.close else None

    # If order has an old date to open it's a MARKET order
    # We need to fill it immediately
    if not order.open_value and order.amount and order.status:
        with db.atomic() as txn:
            order.open = datetime.datetime.now()
            order.open_value = last_price().value
            order.save()
            updateLedger(order)
        return order


    # If order has an open value it's a LIMIT order.
    if order.open_value and order.amount and order.status:
        with db.atomic() as txn:
            order.save()
            wsSend('MESSAGE;reload;orders;' + str(order.user.id))
            return order

    return {'message': 'Something was wrong with this order.'}


'''
Fill orders
'''
def fillOrders(price, db):
    v = price['value']
    vmax = v + v/1000 # 0.001% up
    vmin = v - v/1000 # 0.001% down
    # Fill outstanding orders
    with db.atomic() as txn:
        # Execute limit orders
        orders = Order.select().where(
            Order.open_value.between(vmin, vmax),
            Order.open == None,
            Order.status == True)
        query = Order.update(
            open = datetime.datetime.now(),
            open_value = v
        ).where(Order.id << [order.id for order in orders])
        query.execute()
        # update ledger
        [updateLedger(order) for order in orders]

        # Fill stoplosses
        orders = Order.select().where(
            Order.stoploss.between(vmin, vmax),
            Order.open_value > v,
            Order.close_value == None,
            Order.status == True)
        query = Order.update(
            stoploss_trigered = datetime.datetime.now(),
            close = datetime.datetime.now(),
            close_value = v,
            status = False,
            comment = 'Stoploss triggered'
        ).where(Order.id << [order.id for order in orders])
        query.execute()
        [updateLedger(order) for order in orders]

        # Fill take profits
        orders = Order.select().where(
            Order.takeprofit.between(vmin, vmax),
            Order.open_value < v,
            Order.status == True)
        query = Order.update(
            takeprofit_trigered = datetime.datetime.now(),
            close = datetime.datetime.now(),
            close_value = v,
            status = False,
            comment = 'Take profit triggered'
        ).where(Order.id << [order.id for order in orders])
        query.execute()
        [updateLedger(order) for order in orders]


'''
Ledger updater
'''
def updateLedger(order):
    order = order.refresh()  # refresh order from db
    ledger = order.user.ledgers.where(Ledger.asset == order.base).first()

    # For freshly opened orders
    if not order.close:
        ledger.value -= order.amount

    # For orders being closed
    if order.close:
        ledger = order.user.ledgers.where(Ledger.asset == order.base).first()  # get ledger for the base c.
        ledger.value += order.amount + order.close_value - order.open_value  # add the value to ledger

    ledger.save() # save it

    # message clients to reload
    wsSend('MESSAGE;reload;orders;' + str(order.user.id))

'''
Margin call monitor
'''
def marginCallMonitor(price):
    v = price['value']

    with db.atomic() as txn:
        # Select all orders
        orders = Order.select().where(
            Order.open != None,
            Order.open_value != None,
            Order.status == True,
        )
        if not orders:
            return

        users = {}
        for order in orders:
            users[order.user.id] = order.user

        for id, user in users.items():
            for ledger in user.ledgers:
                # Assume 0 exposure
                exposure = 0
                # Collect all open orders for the asset
                orders = user.orders.where(
                    Order.base == ledger.asset,
                    Order.open != None,
                    Order.open_value != None,
                    Order.status == True,)
                if not orders:
                    return

                # Calculate value of the open order and add it to exposure
                for order in orders:
                    value = v - order.open_value
                    exposure += value
                # If exceeds 90% of ledger value
                if exposure < 0 and (ledger.value + exposure) < (ledger.value / 10):
                    # Liquidate all open orders
                    query = Order.update(
                        stoploss_trigered = datetime.datetime.now(),
                        close = datetime.datetime.now(),
                        close_value = v,
                        status = False,
                        comment = 'Margin call'
                    ).where(Order.id << [order.id for order in orders])
                    query.execute()
                    # Save ledger
                    ledger.value += exposure
                    ledger.save()

                    # message clients to reload
                    wsSend('MESSAGE;reload;orders;' + str(order.user.id))


if __name__ == '__main__':
    print('Nothing to do')