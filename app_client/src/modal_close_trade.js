import Component from 'inferno-component'
import {hasClass, addClass, removeClass} from './manipulators'
import { orders, WSConnection } from './resources'

export class ModalCloseTrade extends Component {
	constructor(props) {
        super(props)
		this.state = {
            trade: props.trade,
            user: props.user,
            modal: props.modal,
            visible_el: false,
            message: 'Please confirm liquidation of position.'
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

    CloseTrade(trade, user) {
        let modal_self = this
        trade.close = (new Date()).toISOString()
        orders(trade.id).put(trade)
        this.state.modal.closeTrade = false
    }


    render() {
        return (
            <div class="f-modal">
                <div class="f-window f-warning">
                    <h2>Closing position no. {this.state.trade.id}</h2>
                    <div class="content">{this.state.message}</div>
                    <div class="f-buttonbar">
                        <button class="pure-button" onClick={(e)=>{ this.state.modal.closeTrade = false }}>Cancel</button>
                        <button class="pure-button pure-button-primary" onClick={(e)=>{ this.CloseTrade(this.state.trade, this.state.user) }}>Close</button>
                    </div>
                </div>
            </div>
        )
    }

}

export default ModalCloseTrade