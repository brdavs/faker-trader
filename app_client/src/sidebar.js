import Component from 'inferno-component'
import { users, orders, transformDate, WSConnection } from './resources'
import {hasClass, addClass, removeClass} from './manipulators'
import SidebarOrders from './sidebar_orders'
import SidebarNewOrder from './sidebar_new_order'

export class Sidebar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: {BTC: [0, 0]},
            trades: [],
            orders: [],
            history: [],
            nav: 0,
            user: props.user,
            action: false,
            visibility: {
                trade: false,
                overview: 1
            },
        };
    }

    componentWillMount() {
        self = this
        this.w = WSConnection
        this.w.onopen = (evt) => { /* self.w.send('MESSAGE;ident;'+this.state.user.id) */ }
        this.w.onmessage = (evt) => {
            /**
             * WEBSOCKET BROKER... might want to put it somewhere else
             */
            // We only get ident immediately after connect
            let [reason, what, data] = evt.data.split(';')
            // We send user ID and hash as ident immediately back
            if(what=='ident') self.w.send(`MESSAGE;ident;${data};${this.state.user.id}`)
            // We reload orders if needed
            if(what=='reload' & data == 'orders') 
                orders.get()
                .then(o => {
                    this.state.user.orders = o
                    this.updateNav(this.state.value[0])
                })


            // Then run our course
            if(reason!='MESSAGE') self.updateAssetValues(evt)
        }
        this.w.onerror = (evt) => { console.log(evt) }
    }

    updateAssetValues(evt) {
        let self = this

        // Update current values from feed
        let value = this.state.value
        let [asset, t, v] =  evt.data.split(';')
            .map(n => n.includes('.') ? parseFloat(n) : parseInt(n) ? parseInt(n) : n)

        this.state.user.ledgers.forEach(l => {
            if(!asset) return
            value[asset] = [v, value[asset][0]]
        })
        this.setState({value})

        // calculate additional order values
        let user = this.state.user
        user.orders = user.orders.map(self.calcOrderDetails)
        this.setState({user})

        // Update upper portion of screen with data
        this.updateNav(v)
    }

    // calculate some values for template later on
    calcOrderDetails(order) {
        let current_value = order.amount * self.state.value.BTC[0]
        let open_value = order.amount * order.open_value
        let direction = order.direction ? 1 : -1
        order.distance_to_open = current_value - open_value
        order.earnings = order.distance_to_open * direction
        order.earnings_percent = order.distance_to_open / open_value * 100  * direction
        return order
    }

    
    updateNav(v) {
        // Get open trades
        let open_trades = this.state.user.orders.filter(o => 
            o.open != null && o.status == true
        )
        // Calculate total gain
        let total_gain = open_trades
            .map(o => o.earnings * (o.direction ? 1 : -1) )
            .reduce((a,v) => a + v, 0)
        
        let nav = this.state.user.ledgers[0].value + total_gain
        this.setState({nav})
    }

    render() {
        return (
            <div class="pure-g f-side-bar">


                {/* Current status of affairs */}
                <div class="pure-u-1">
                    <div class="f-pad f-nav">
                        <small class="">Ledger value</small>
                        {this.state.user.ledgers.map(ledger =>
                            <div class="f-ledger"><h3>{ledger.value.toFixed(4)}</h3> <span>{ledger.asset.name}</span></div>
                        )}
                        <hr />
                        <small class="">Net Asset Value</small>
                        <div class="f-ledger"><h3>{this.state.nav.toFixed(4)}</h3> <span>EUR</span></div>
                        <hr />
                        <small class="">Current COIN value</small>
                        {Object.keys(this.state.value).map(k =>
                            <div class="f-ledger"><h3>{this.state.value[k][0].toFixed(4)}</h3> <span>EUR</span></div>
                        )}
                    </div>
                </div>
                

                < SidebarNewOrder value={this.state.value.BTC[0]}  state={this.state}/>

                <SidebarOrders state={this.state} />


            </div>
        )
    }

}

export default Sidebar
