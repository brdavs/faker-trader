import Component from 'inferno-component'
import {hasClass, addClass, removeClass} from './manipulators'
import { orders, WSConnection } from './resources'

export class ModalDeleteOrder extends Component {
	constructor(props) {
        super(props)
		this.state = {
            trade: props.trade,
            user: props.user,
            visible_el: false,
            message: 'Please confirm deletion of order.'
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.content != this.state.content)
            this.setState({content: this.state.content})
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

    deleteOrder(trade, user) {
        let modal_self = this
        orders(trade.id).delete()
    }


    render() {
        return (
            <button class="pure-button pure-button-primary button-error" onClick={(e)=>{ this.askWithModal(e) }}>
            Delete order
                <div class="f-modal hidden">
                    <div class="f-window f-warning">
                        <h2>Deleting order no. {this.state.trade.id}</h2>
                        <div class="content">{this.state.message}</div>
                        <div class="f-buttonbar">
                            <button class="pure-button" onClick={(e)=>{ this.askWithModal(e) }}>Cancel</button>
                            <button class="pure-button pure-button-primary button-error" onClick={(e)=>{ this.deleteOrder(this.state.trade, this.state.user) }}>Delete</button>
                        </div>
                    </div>
                </div>
            </button>
        )
    }

}

export default ModalDeleteOrder