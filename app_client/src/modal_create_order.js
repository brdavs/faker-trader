import Component from 'inferno-component'
import {hasClass, addClass, removeClass} from './manipulators'
import { orders } from './resources'

export class ModalCreateOrder extends Component {
	constructor(props) {
        super(props)
        this.state = {
            order: props.order,
            value: props.value,
            visible_el: false,
            message: `Please confirm creation of new ${props.order._type} ${props.order.modal} order`
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({user: nextProps.user})
        this.setState({value: nextProps.value})
    }

    askWithModal(e) {
        let el = e ? e.target.parentElement.querySelector('.f-modal.hidden') : false
        if(el) {
            removeClass(el, 'hidden')
            this.setState({visible_el: el})
        } else if (this.state.visible_el) {
            addClass(this.state.visible_el, 'hidden')
            this.setState({visible_el: false})
        }
    }

    createOrder(self) {
        return e => {
            orders.post(self.state.order)
            .then(r => {
                if(r.message || r.error) {
                    let message = message || error
                    self.setState({message})
                    return false
                } else {
                    return users.get(this.state.user.id)
                }
            })
            .then(user => {
                if(!user) return
                self.setState({user})
                self.state.order.amount = 0
                self.state.order.open_value = 0
                self.state.order._type = null
                self.state.order.modal = false
            })
        }
    }
    createOrder(self) {
        return e => {
            orders.post(self.state.order)
            self.state.order.modal = false
        }
    }


    allowButtons() {
        if (this.state.order.amount) {
            if(!this.state.order._type && !this.state.order.open_value) return true
            if (this.state.order._type && this.state.order.open_value) return true
        }
    }

    render() {
        return (
            <div class="f-modal">
                <div class="f-window f-warning">
                    <h2>Creating a new order</h2>
                    <div class="content">
                        {this.state.message.replace('_', this.state.order.modal)} in value of
                    <h3>{this.state.order.amount} EUR ( {(this.state.order.amount / this.state.value).toFixed(4)} COIN)</h3>

                    </div>
                    <div class="f-buttonbar">
                        <button class="pure-button" type="button"
                                onClick={(e) => { this.state.order.modal = false }}>Cancel</button>
                        <button class="pure-button pure-button-primary" type="button" 
                                onClick={this.createOrder(this)}>Create order</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default ModalCreateOrder