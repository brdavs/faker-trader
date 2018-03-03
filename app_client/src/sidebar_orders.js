import Component from 'inferno-component'
import { transformDate, toggleVisibility } from './resources'
import {hasClass, addClass, removeClass} from './manipulators'
import Modal from './modal'
import ModalDeleteOrder from './modal_delete_order'
import ModalCloseTrade from './modal_close_trade'


export class SidebarOrders extends Component {
	constructor(props) {
		super(props)
        this.state = props.state;
    }


    componentWillReceiveProps(nextProps) {
        Object.keys(nextProps.state).forEach(k => {
            let item = {}
            item[k] = nextProps.state[k]
            this.setState(item)
        })
    }

    /**
     * Custom methods
     */

     getOpenTrades() {
        return this.state.user.orders.filter(o => 
            o.open != null && o.status == true
        )
    }

    getOpenOrders() {
        return this.state.user.orders.filter(o => 
            o.open == null && o.status == true
        )
    }

    getHistoricOrders() {
        return this.state.user.orders.filter(o => o.status == false )
    }

    closedOrderEarnings(order) {
        let earnings = {
            value: (order.close_value - order.open_value) * order.amount * (order.direction ? 1 : -1)
        }
        earnings['percent'] = order.amount / 100 / earnings.value
        return earnings
    }

    render() {
        return (
            <div class="pure-u-1">
                <Modal content={this.state.modal} />
                <h2>Overview</h2>
                <div class="pure-menu pure-menu-horizontal">
                    <ul class="pure-menu-list">
                        <li class="pure-menu-item pure-menu-selected">
                            <a href="#" class="pure-menu-link" onClick={(e) => { toggleVisibility(e, 'f_trades', 'f-trade') }}>Trades</a>
                        </li>
                        <li class="pure-menu-item">
                            <a href="#" class="pure-menu-link" onClick={(e) => { toggleVisibility(e, 'f_orders', 'f-trade') }}>Orders</a>
                        </li>
                        <li class="pure-menu-item">
                            <a href="#" class="pure-menu-link" onClick={(e) => { toggleVisibility(e, 'f_history', 'f-trade') }}>History</a>
                        </li>
                    </ul>
                </div>
                <div class="f-pad f-nav f-trade" id="f_trades">
                    {this.getOpenTrades().map(t =>
                        <table>
                            <tr>
                                <td>Order ID:</td><td>{t.id}</td>
                            </tr>
                            <tr>
                                <td>Open:</td><td>{transformDate(t.open)}</td>
                            </tr>
                            <tr>
                                <td>Open value:</td><td>{t.open_value.toFixed(4)} €</td>
                            </tr>
                            <tr>
                                <td>Direction:</td><td>{t.direction ? 'Buy' : 'Sell'}</td>
                            </tr>
                            <tr>
                                <td>Amount:</td><td>{t.amount.toFixed(4)} €</td>
                            </tr>
                            <tr>
                                <td>Amount in COIN:</td><td>{t.amount_in_quote ? t.amount_in_quote.toFixed(4) : null} COIN</td>
                            </tr>
                            <tr>
                                <td>Earnings:</td><td>{t.earnings ? t.earnings.toFixed(4) : null} €</td>
                            </tr>
                            <tr>
                                <td>Earnings %:</td><td>{t.percent_gain ? t.percent_gain.toFixed(4) : null} %</td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <ModalCloseTrade user={this.state.user} trade={t}/>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2"><hr /></td>
                            </tr>
                        </table>
                    )}
                </div>
                <div class="f-pad f-nav f-trade hidden" id="f_orders">
                    {this.getOpenOrders().map(t =>
                        <table>
                            <tr>
                                <td>Order ID:</td><td>{t.id}</td>
                            </tr>
                            <tr>
                                <td>Amount:</td><td>{t.amount.toFixed(4)} €</td>
                            </tr>
                            <tr>
                                <td>created:</td><td>{transformDate(t.created)}</td>
                            </tr>
                            <tr>
                                <td>Open at:</td><td>{t.open_value} €</td>
                            </tr>
                            <tr>
                                <td>Type:</td><td>{t.direction ? 'Buy' : 'Sell'}</td>
                            </tr>
                            <tr>
                                <td>Distance:</td><td>{t.distance_to_open ? t.distance_to_open.toFixed(4) : null} €</td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <ModalDeleteOrder trade={t} user={this.state.user}/>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2"><hr /></td>
                            </tr>
                        </table>
                    )}
                </div>
                <div class="f-pad f-nav f-trade hidden" id="f_history">
                    {this.getHistoricOrders().map(t =>
                        <table>
                            <tr>
                                <td>Order ID:</td><td>{t.id}</td>
                            </tr>
                            <tr>
                                <td>Amount:</td><td>{t.amount.toFixed(4)} €</td>
                            </tr>
                            <tr>
                                <td>Open:</td><td>{transformDate(t.open)}</td>
                            </tr>
                            <tr>
                                <td>Open value:</td><td>{t.open_value.toFixed(4)} €</td>
                            </tr>
                            <tr>
                                <td>Close:</td><td>{transformDate(t.close)}</td>
                            </tr>
                            <tr>
                                <td>Close value:</td><td>{t.close_value.toFixed(4)} €</td>
                            </tr>
                            <tr>
                                <td>Type:</td><td>{t.direction ? 'Buy' : 'Sell'}</td>
                            </tr>
                            <tr>
                                <td>Earnings:</td><td>{(t.close_value - t.open_value).toFixed(4)} €</td>
                            </tr>
                            <tr>
                                <td>Earnings %:</td><td>{((t.close_value / t.open_value  - 1) * 100).toFixed(4) } %</td>
                            </tr>
                            {t.comment ?
                                <tr>
                                    <td>Comment:</td><td>{t.comment}</td>
                                </tr> : null}
                            <tr>
                                <td colspan="2"><hr /></td>
                            </tr>
                        </table>
                    )}
                </div>
            </div>
        )
    }

}

export default SidebarOrders
