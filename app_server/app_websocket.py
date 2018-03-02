import sys
sys.path.append('../')

from app_server.config import *
from app_server.models import *
import json
from app_server.tools import *
import string
import datetime
import threading
import time
import random
import sqlite3


from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

db = SqliteDatabase(DATABASE)

'''
Data Formater
'''
def formatData(data):
    value = str(data['value'])
    instant = str(int(round(time.time() * 1000)))
    return 'BTC;' + instant + ';' + value # We could parametrize 'BTC' for many different graphs, but we only have 1 runner now

'''
DB saver
'''
def presistData(p, conn):
    c = conn.cursor()
    instant = datetime.datetime.now()
    c.execute('INSERT INTO price VALUES( NULL, 1, ?, ?)', (instant, p['value']))
    conn.commit()


'''
Simple fake data generator function
'''
def generator(p, clients):
    conn = sqlite3.connect(DATABASE)
    def mover(seconds, distance, p):
        s = seconds
        d = random.uniform(-distance, distance+0.0001)
        step = d / seconds
        while True:
            # print(position)
            p['value'] += step
            s -= 1
            if s == 0:
                s = random.randint(1, seconds)
                d = random.uniform(-distance, distance+0.0001)
                step = d / s
                # print('change {} {} {}'.format(d, s, step))
            time.sleep(1)

    defaults = [
        {'seconds': 10, 'distance': 5},
        {'seconds': 60, 'distance': 20},
        {'seconds': 60*60, 'distance': 100},
        {'seconds': 60*60*24, 'distance': 500}
    ]

    for d in defaults:
        thread = threading.Thread(target=mover, args=(d['seconds'], d['distance'], p))
        thread.start()

    while True:
        presistData(p, conn) # Presist to database
        fillOrders(p, db) # Fill outstanding orders
        marginCallMonitor(p) # Monitor for margin calls
        for client in clients.values(): # Just send this drivel to all clients
            client.sendMessage(formatData(p))
        p['value'] += random.uniform(-1, 1)
        time.sleep(random.uniform(0.05, 2))





'''
WS Server
'''

clients = {}
class FakeData(WebSocket):

    # This messaging goes like this:
    #
    def handleMessage(self):
        reason, what, data, id = self.data.split(";")
        if reason == 'MESSAGE':
            # If we recieve ident (ID of user)
            if what == 'ident':
                # We remove socket from clients
                del clients[data]
                # Then use our id as it's rightful place in dict
                clients[int(id)] = self
            # Any other message than ident originates from server,
            # so we simpli forward it to the right client
            else:
                clients[int(id)].sendMessage(self.data)


    def handleConnected(self):
        # createse a simple hash
        hash = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        # appends it to a temporary dict
        clients[hash] = self
        # Sends it to client
        time.sleep(1) # Whatever... stupid browser too fast for it's pants.
        self.sendMessage('MESSAGE;ident;'+hash)
        # client sends user ID with the hash back and we can always pinpoint the user
        # when pyramid wants to send that user data

    def handleClose(self):
        for item in clients.items():
            if item[1] == self:
                del clients[item[0]]




def main_websocket():
    print('Running websockets server on port: ' + str(WEBSOCKETS_PORT))
    thread = threading.Thread(target=generator, args=({'value': 100}, clients))
    thread.start()
    server = SimpleWebSocketServer('', WEBSOCKETS_PORT, FakeData)
    server.serveforever()

if __name__ == '__main__':
    main_websocket()