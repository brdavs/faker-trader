import sys
sys.path.append('../')

from app_server.config import *
from peewee import *
import datetime


db = SqliteDatabase(DATABASE)
dbp = SqliteDatabase(DATABASE_PRICES)

class BaseModel(Model):
    class Meta:
        database = db
    def refresh(self):
        return type(self).get(self._pk_expr())

class BaseModelPrices(Model):
    class Meta:
        database = db
    def refresh(self):
        return type(self).get(self._pk_expr())


class User(BaseModel):
    username = CharField(null=False, unique=True)

class Asset(BaseModel):
    name = CharField(null=False, unique=True)


class Order(BaseModel):
    user = ForeignKeyField(User, backref='orders')
    base = ForeignKeyField(Asset, backref='orders', null=False)
    quote = ForeignKeyField(Asset, backref='orders', null=False)
    direction = BooleanField()
    amount = FloatField(null=False)
    open = DateTimeField(formats=['%Y-%m-%d %H:%M:%S.%f'], null=True)
    open_value = FloatField(null=True)
    close = DateTimeField(formats=['%Y-%m-%d %H:%M:%S.%f'], null=True)
    close_value = FloatField(null=True)
    stoploss = FloatField(null=True)
    stoploss_trigered = DateTimeField(formats=['%Y-%m-%d %H:%M:%S.%f'], null=True)
    takeprofit = FloatField(null=True)
    takeprofit_trigered = DateTimeField(formats=['%Y-%m-%d %H:%M:%S.%f'], null=True)
    created = DateTimeField(formats=['%Y-%m-%d %H:%M:%S.%f'], default=datetime.datetime.now, null=False)
    comment = TextField(null=True)
    status = BooleanField(null=False, default=True)

class Ledger(BaseModel):
    user = ForeignKeyField(User, backref='ledgers')
    asset = ForeignKeyField(Asset, backref='ledgers', null=True)
    value = FloatField(null=False)

class Price(BaseModelPrices):
    asset = ForeignKeyField(Asset, backref='prices', null=True)
    datetime = DateTimeField(formats=['%Y-%m-%d %H:%M:%S.%f'], default=datetime.datetime.now, null=False)
    value = FloatField(null=False)


if __name__ == '__main__':
    db.connect()
    db.create_tables([User, Asset, Order, Ledger])
    dbp.connect()
    dbp.create_tables([Price])

    # Create default stuff (Money)
    for mu in 'EUR COIN'.split(' '):
        asset = Asset.create(name=mu)
