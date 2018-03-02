import sys
sys.path.append('../')

from app_server.models import *
import datetime
from random import randint


for a in 'EUR BTC ETH ROX'.split(' '):
    asset = Asset.create(name=a)
    asset.save()

#for u in 'toni baloni prdo smrdo gnusa kekec pekec velikonja prdonja špeho mamba friko pohica neznanec abnormalnež vrag opel pismo nočni aufbiks bebo'.split(' '):
for u in 'toni baloni'.split(' '):
    user = User.create(username=u)
    user.save()
    ledger = Ledger.create(
        user=user,
        asset_id=1,
        value=10000
    )
    ledger.save()
    # open trades
    for n in range(0, 10):
        o = Order.create(
            user = user,
            base_id=1,
            quote_id=2,
            amount=randint(10, 20),
            direction=randint(0, 1),
            open = datetime.datetime.now(),
            close = None,
            open_value = randint(80, 120),
            close_value = None,
            status= True,
        )
        o.save()
    # limit orders
    for n in range(1, 10):
        o = Order.create(
            user = user,
            base_id=1,
            quote_id=2,
            amount=randint(10, 20),
            direction=randint(0, 1),
            open = None,
            close = None,
            open_value = randint(80, 120),
            close_value = None,
            status= True,
        )
        o.save()

    # closed orders
    # for n in range(0, 5):
    #     o = Order.create(
    #         user = user,
    #         base_id=1,
    #         quote_id=2,
    #         amount=randint(100, 300),
    #         direction=randint(0, 1),
    #         open = datetime.datetime.now(),
    #         close = datetime.datetime.now(),
    #         open_value = randint(80, 120),
    #         close_value = randint(100, 150),
    #         status= False,
    #     )
    #     o.save()

# Market Order
# startvalue = 950
# for n in range(0, 100):
#     o = Order.create(
#         user_id=1,
#         base_id=None,
#         quote_id=1,
#         direction=True,
#         open=None,
#         open_value=startvalue,
#         close=None,
#         close_value=None,
#         status=True,
#     )
#     o.save()
#     startvalue += 1


# stoploss = 990
# for n in range(0, 20):
#     o = Order.create(
#         user_id=1,
#         base_id=None,
#         quote_id=1,
#         direction=True,
#         open=datetime.datetime.now(),
#         open_value=2000,
#         close=None,
#         close_value=None,
#         stoploss=stoploss,
#         status=True,
#     )
#     o.save()
#     stoploss += 1