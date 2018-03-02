import { render } from 'inferno'
import {  Router, Link, Route, IndexRoute, IndexLink  } from 'inferno-router'
import createBrowserHistory from 'history/createBrowserHistory'
import FakerTrader from './app'
import './style.scss'

const browserHistory = createBrowserHistory()

const render_app = () => {
    return render(
        <Router history={ browserHistory }>
            <Route component={FakerTrader}>
            </Route>
        </Router>
        , document.getElementById('faker_trader')
    )
}

render_app()

