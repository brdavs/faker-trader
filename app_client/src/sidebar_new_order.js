import Component from 'inferno-component'
import {hasClass, addClass, removeClass} from './manipulators'
import { orders } from './resources';
import ModalCreateOrder from './modal_create_order'

export class SidebarNewOrder extends Component {
	constructor(props) {
        super(props)
        this.state = {
            value: props.value,
            user: props.user,
            order: {
                base: 1, // Hardcoded for EUR
                quote: 2, // Hardcoded for (COIN)
                open: 0,
                _type: false,
                open_value: 0,
                direction: false,
                amount: 0,
                status: true
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value})
        this.setState({user: nextProps.user})
    }

    setTType(type) {
        return e => {
            this.state.order._type = type
            let c = 'pure-menu-selected'
            let el = e.srcElement.parentElement
            el.parentElement.querySelectorAll('li').forEach(el => removeClass(el, c))
            addClass(el, c)
        }
    }

    valueUpdater() { 
        return e => {
            let order = this.state.order
            order[e.target.name] = e.target.value
            this.setState({order})
        }
    }

    allowButtons() {
        if (this.state.order.amount > 0 && (this.state.order.amount <= (this.state.user.ledgers[0].value))) {
            if(this.state.order._type=="market" && !this.state.order.open_value) return true
            if (this.state.order._type=='limit' && this.state.order.open_value) return true
        }
    }

    openModal(self, direction) {
        return e => {
            this.state.order.modal = direction
            this.state.order.direction = direction == 'buy'
        }
    }


    isFloat(n) {
        return Number(n) === n && n % 1 !== 0
    }

    render() {
        return (
            <div class="pure-u-1">
            {this.state.order._type}
                <h2>Trade</h2>
                <div class="pure-menu pure-menu-horizontal f-side-order-menu">
                    <ul class="pure-menu-list">
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link" onClick={this.setTType('market')}>Market order</a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link" onClick={this.setTType('limit')}>Limit order</a></li>
                    </ul>
                </div>
                <div class="f-pad f-nav f-order">

                    {/* START order form */}
                    <div class="f-form f-form-buy">
                        <form class="pure-form">
                            <fieldset>

                                <label for="amount">Order amount in EUR:</label>
                                <input id="amount" type="number" step="0.01" min="1"
                                    name="amount"
                                    max={(this.state.user.ledgers[0].value).toFixed(2)}
                                    onInput={this.valueUpdater()} />

                                {this.state.order.open || this.state.order._type == 'limit' ?
                                    <div>
                                        <label for="open_value">Place order at:</label>
                                        <input id="open_value" type="number" step="0.01"
                                            name="open_value"
                                            onInput={this.valueUpdater()} />
                                    </div>
                                    : null}

                                {this.isFloat(this.state.order.amount) ?
                                    <h4>{this.state.order._direction} {this.state.order.amount.toFixed(4)} of COIN</h4>
                                    : null}
                            </fieldset>


                            {/* START Buttons for creating a modal */}
                            <div class="f-buttonbar">
                                <button class="pure-button pure-button-primary sucess"
                                    type="button"
                                    disabled={!this.allowButtons()}
                                    onClick={this.openModal(this, 'buy')} >
                                    Buy
                                    </button>
                                <button class="pure-button pure-button-primary error"
                                    type="button"
                                    disabled={!this.allowButtons()}
                                    onClick={this.openModal(this, 'sell')} >
                                    Sell
                            </button>
                            </div>
                            {this.state.order.modal ?
                                <ModalCreateOrder value={this.state.value} order={this.state.order} />
                                : null}
                            {/* END Buttons for creating a modal */}

                        </form>
                    </div>
                    {/* END order form */}
                </div>
            </div>
        )
    }
}

export default SidebarNewOrder