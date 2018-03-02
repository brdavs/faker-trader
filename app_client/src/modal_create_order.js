import Component from 'inferno-component'
import {hasClass, addClass, removeClass} from './manipulators'
import { orders } from './resources'

export class ModalCreateOrder extends Component {
	constructor(props) {
        super(props)
        this.state = props.state
        this.state['visible_el'] = false
        this.state['message'] = 'Please confirm Creation of new order.'
    }

    componentWillReceiveProps(nextProps) {
        // if(nextProps.content != this.state.content)
        //     this.setState({content: this.state.content})
        this.setState({value: nextProps.value})
    }

    askWithModal(e) {
        let el = e ? e.srcElement.querySelector('.f-modal.hidden') : false
        if(el) {
            removeClass(el, 'hidden')
            this.setState({visible_el: el})
        } else if (this.state.visible_el) {
            addClass(this.state.visible_el, 'hidden')
            this.setState({visible_el: false})
        }
    }

    createOrder(user) {
        return(e) => {
            orders.post(this.state.order)
            .then(r =>  orders.get())
            .then(r => this.state.user.orders = r)
            .then(r => {
                this.state.order.amount = false
                this.state.order.open_value = false
                this.state.order.type = false
            })
        }
    }


    render() {
        return (
            <button class="pure-button pure-button-primary" onClick={(e)=>{ this.askWithModal(e) }}>
                Create a new order
                <div class="f-modal hidden">
                    <div class="f-window f-warning">
                        <h2>Creating a new order</h2>
                        <div class="content">
                            {this.state.message} in value of
                            <h3>{this.state.order.amount} EUR</h3>

                        </div>
                        <div class="f-buttonbar">
                            <button class="pure-button" onClick={(e)=>{ this.askWithModal(e) }}>Cancel</button>
                            <button class="pure-button pure-button-primary" onClick={this.createOrder(this.state.user)}>Create order</button>
                        </div>
                    </div>
                </div>
            </button>
        )
    }

}

export default ModalCreateOrder