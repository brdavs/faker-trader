import Component from 'inferno-component'
import {hasClass, addClass, removeClass} from './manipulators'
import { orders } from './resources';
import ModalCreateOrder from './modal_create_order'

export class SidebarNewOrder extends Component {
	constructor(props) {
        super(props)
        this.state = props.state
        this.state.order = {
            base: 1, // Hardcoded for EUR
            quote: 2, // Hardcoded for BTC (COIN)
            open_value: false, 
            _type: null,
            _direction: null,
            direction: true,
            amount: false,
            status: true
        }
		// this.state = {
        //     ledgers: props.ledgers,
        //     order: {type: 'market', type: 'buy'}
        // };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value})
    }


    setTrade(type, direction) {
        return (e) => {
            
            let el = e.srcElement.parentElement

            var order = this.state.order

            if(type) {
                this.state.order._type = this.state.order._type !=type ? type : false
                order.open_value = type=='limit' ? this.state.value : null
            }
            if(direction) {
                order.direction = direction == 'buy'
                order._direction = direction
            }

            this.setState({order})


            e.srcElement.parentElement.parentElement.querySelectorAll('li')
                .forEach(el => removeClass(el, 'pure-menu-selected'))
            addClass(el, 'pure-menu-selected')
        }
    }

    updateAmount() {
        return e => {
            this.state.order.amount = e.target.value / this.state.value
            return this.state.order.amount
        }
    }

    render() {

        if (this.state.order._type)
            var form = (
                <div class="f-form f-form-buy">
                    <form class="pure-form">
                        <fieldset>

                            <label for="amount">Order amount in EUR:</label>
                            <input id="amount" type="number" step="0.01" min="1" max={(this.state.user.ledgers[0].value * 0.9).toFixed(2)} onInput={this.updateAmount()} />

                            {this.state.order._type == 'limit' ?
                                <div>
                                    <label for="open_value">Place order at:</label>
                                    <input id="open_value" type="number" step="0.01" onInput={this.updateAmount()} />
                                </div>
                            : null}

                            {this.state.order.amount && this.state.order._direction?
                                <h4>{this.state.order._direction} {(this.state.order.amount).toFixed(4)} of COIN</h4>
                            :null}
                        </fieldset>
                        {this.state.order.amount && this.state.order._direction?
                            <ModalCreateOrder state={this.state} />
                        : null}
                    </form>
                </div>
            )




        return (
            <div class="pure-u-1">
                <h2>Trade</h2>
                <div class="pure-menu pure-menu-horizontal f-side-order-menu">
                    <ul class="pure-menu-list">
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link" onClick={this.setTrade('market')}>Market order</a></li>
                        <li class="pure-menu-item"><a href="#" class="pure-menu-link" onClick={this.setTrade('limit')}>Limit order</a></li>
                    </ul>
                </div>
                {this.state.order._type ?
                    <div class="pure-menu pure-menu-horizontal f-side-order-menu">
                        <ul class="pure-menu-list">
                            <li class="pure-menu-item"><a href="#" class="pure-menu-link" onClick={this.setTrade(false, 'buy')}>Buy</a></li>
                            <li class="pure-menu-item"><a href="#" class="pure-menu-link" onClick={this.setTrade(false, 'sell')}>Sell</a></li>
                        </ul>
                    </div>
                :null}
                    <div class="f-pad f-nav f-order">
                        {form ? form : null}

                    </div>
            </div>
        )
    }

}

export default SidebarNewOrder