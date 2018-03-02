import sys
sys.path.append('../')

from multiprocessing import Process
from app_server.app_pyramid import app_pyramid
from app_server.app_websocket import main_websocket


# Parallelizer function
def parallel(*funcs):
    proc = []
    for f in funcs:
        p = Process(target=f)
        p.start()
        proc.append(p)
    for p in proc:
        p.join()


if __name__ == '__main__':
    parallel(main_websocket, app_pyramid)


