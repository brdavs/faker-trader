import sys
sys.path.append('../')

from app_server.config import *
import os
import json
import time
from waitress import serve
from playhouse.shortcuts import *
from pyramid.config import Configurator
from pyramid.response import Response, FileResponse
from pyramid.view import view_defaults, view_config
from pyramid.session import SignedCookieSessionFactory
from pyramid.renderers import JSON

from app_server.models import *
from app_server.tools import *

'''
Initialize some stuff
'''
sf = SignedCookieSessionFactory(SEECRET, cookie_name='faker_trader_session')
out = {'message': 'Nothing happened.'}
json_renderer = JSON()
json_renderer.add_adapter(datetime.datetime, datetime_adapter)


@view_defaults(route_name='user', renderer='json')
class UserView(object):
    def __init__(self, request):
        self.request = request

    '''
    List all users
    '''
    @view_config(route_name='users', request_method='GET')
    def list_items(self):
        try:
            out = [model_to_dict(user) for user in User.select()]
        except:
            err = 'Could not show users.'
            out = {'error': err}
        return out

    '''
    Show a single user
    '''
    @view_config(request_method='GET')
    def get_item(self):
        session = self.request.session
        session.cookie_max_age = SESSION_TTL
        try:
            id = self.request.matchdict.get('id')
            user = User.get(User.id == id)
            session['user'] = model_to_dict(user)
            out = model_to_dict(user, backrefs=True, max_depth=1)
        except:
            err = 'User does not exist.'
            out = {'error': err}
        return out

    '''
    Create a new user
    '''
    @view_config(route_name='users', request_method='POST')
    def create_item(self):
        session = self.request.session
        session.cookie_max_age = SESSION_TTL
        try:
            username = self.request.json.get('username')
        except:
            return {'error': 'Wrong data.'}
        try:
            user = User.create(username=username)
            user.save()
            Ledger.create(**DEFAULT_LEDGER, user=user)
            out = model_to_dict(user, backrefs=True)
        except:
            err = 'Username "%s" is already in use.' % username
            print(err)
            out = {'error': err}
        return out

    '''
    Update user
    '''
    @view_config(request_method='PUT')
    def update_item(self):
        return {'message:' 'Not implemented yet.'}

    '''
    Delete user
    '''
    @view_config(request_method='DELETE')
    def delete_item(self):
        session = self.request.session
        sid = session.get('user', {}).get('id', 0)

        try:
            id = self.request.matchdict.get('id')
            if sid == int(id):
                user = User.get(User.id == id)
                user.delete_instance()
                out['message'] = 'User deleted.'
            else:
                out['message'] = 'You do not have the permission to do that.'
        except:
            err = 'Could not delete user.'
            out = {'error': err}
        return out

    '''
    Additional user methods
    '''
    @view_config(route_name='user_data', renderer='json', request_method='GET')
    def user_data(self):
        session = self.request.session
        try:
            id =  session.get('user').get('id')
            user = User.get(User.id == id)
            out = model_to_dict(user, backrefs=True, max_depth=1)
        except:
            out = {'message': 'Can not retrieve user.'}
        return out



@view_defaults(route_name='order', renderer='json')
class OrderView(object):
    def __init__(self, request):
        self.request = request

    '''
    Show orders
    '''
    @view_config(route_name='orders', request_method='GET')
    def list_items(self):
        session = self.request.session

        try:
            user = User.get(User.id == session['user']['id'])
            out = [model_to_dict(order) for order in user.orders]
        except:
            err = 'Could not show orders.'
            out = {'error': err}
        return out

    '''
    Show a single order
    '''
    @view_config(request_method='GET')
    def get_item(self):
        session = self.request.session
        try:
            user = User.get(User.id == session['user']['id'])
            id = self.request.matchdict.get('id')
            order = Order.get(Order.id == id, Order.user == user)
            out = model_to_dict(order)
            if not out:
                out = {'message': 'Could not show order.'}
        except:
            out = {'error': 'Could not show order.'}
        return out

    '''
    Create Order
    '''
    @view_config(route_name='orders', request_method='POST')
    def create_item(self):
        session = self.request.session
        try:
            user = User.get(id=session['user']['id'])
            order = Order.create(user=user, **self.request.json)
            order = handle_order(order)
            out = model_to_dict(order, backrefs=True)
        except:
            err = 'Could not create order.'
            print(err)
            out = {'error': err}
        return out

    @view_config(request_method='PUT')
    def update_item(self):
        session = self.request.session
        try:
            updated_order = self.request.json
            user = User.get(id=session['user']['id'])
            order = Order.get(Order.id == updated_order['id'], Order.user == user)
        except:
            out = {'error': 'Could not fill request.'}
            return out

        if updated_order['close']:
            with db.atomic() as txn:
                d = datetime.datetime.now()
                v = last_price()
                # Update order
                query = Order.update(
                    takeprofit = v.value,
                    close_value = v.value,
                    close = d,
                    comment = 'Manually closed order.',
                    status = False
                ).where(Order.id == order.id)
                query.execute()
                updateLedger(order)

            out = {'success': 'You successfully closed order'}
        else:
            out['message'] = 'Order was not closed.'

        # message clients to reload
        wsSend('MESSAGE;reload;orders;' + str(order.user.id))
        return out


    @view_config(request_method='DELETE')
    def delete_item(self):
        session = self.request.session
        try:
            user = User.get(id=session['user']['id'])
            id = self.request.matchdict.get('id')
            order = Order.get(Order.user == user, Order.id == id)
        except:
            out = {'error': 'Could not delete order.'}
            return out

        if not order:
            out['message'] = 'Order is missing'
        elif order.status == True and not order.open:
            order.delete_instance()
            out = {'success': 'Order no. %s successfully deleted.' % str(order.id)}
        else:
            out['message'] = 'You do not have the permission to do that.'

        # message clients to reload
        wsSend('MESSAGE;reload;orders;' + str(order.user.id))
        return out




# Serve Index
def index(request):
    return FileResponse(
        os.path.dirname(os.path.realpath(__file__))+'/assets/index.html',
        request=request,
        content_type='text/html'
    )


def app_pyramid():
    with Configurator() as config:
        # Index
        config.add_route('index', '/')
        config.add_view(index, route_name='index', request_method='GET')

        # USER route and views
        config.add_route('users', '/api/users')
        config.add_route('user', '/api/users/{id}')
        config.add_view(UserView, attr='list_items', route_name='users', request_method='GET')
        config.add_view(UserView, attr='get_item', route_name='user', request_method='GET')
        config.add_view(UserView, attr='create_item', route_name='users', request_method='POST')
        config.add_view(UserView, attr='update_item', route_name='user', request_method='PUT')
        config.add_view(UserView, attr='delete_item', route_name='user', request_method='DELETE')

        config.add_route('user_data', '/api/user_data')
        config.add_view(UserView, attr='user_data', route_name='user_data', request_method='GET')

        # ORDER route and views
        config.add_route('orders', '/api/orders')
        config.add_route('order', '/api/orders/{id}')
        config.add_view(OrderView, attr='list_items', route_name='orders', request_method='GET')
        config.add_view(OrderView, attr='get_item', route_name='order', request_method='GET')
        config.add_view(OrderView, attr='create_item', route_name='orders', request_method='POST')
        config.add_view(OrderView, attr='update_item', route_name='order', request_method='PUT')
        config.add_view(OrderView, attr='delete_item', route_name='order', request_method='DELETE')

        # init static files
        config.add_static_view(name='assets', path=os.path.dirname(os.path.realpath(__file__))+'/assets')

        # Set up sessions
        config.set_session_factory(sf)

        # Set up additional JSON renderer
        config.add_renderer('json', json_renderer)
        
        app = config.make_wsgi_app()
    serve(app, host='0.0.0.0', port=8000)

if __name__ == '__main__':
    app_pyramid()