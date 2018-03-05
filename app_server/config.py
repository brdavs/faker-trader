SEECRET = 'Extremely secretive seecret. You could not guess this one if your life depended on it.'
DATABASE = 'db/data.db'
DATABASE_PRICES = 'db/prices.db'
SESSION_TTL = 240

WEBSOCKETS_PORT= 7334
WEBSOCKETS_URI = 'ws://localhost:' + str(WEBSOCKETS_PORT)

DEFAULT_LEDGER = {
    'value': 10000,
    'asset_id': 1
}
DEFAULT_COIN_PRICE = 500

RECORDS_FOR_TIMEFRAME = 260