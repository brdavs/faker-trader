import Component from 'inferno-component'
import { users, orders, user_data, transformDate, WSConnection } from './resources'
import {hasClass, addClass, removeClass} from './manipulators'
import SidebarOrders from './sidebar_orders'
import SidebarNewOrder from './sidebar_new_order'

export class Sidebar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: {COIN: [0, 0]},
            trades: [],
            orders: [],
            history: [],
            nav: 0,
            gain: 0,
            user: props.user,
            ws: props.ws
        };
    }

    componentWillMount() {
        self = this
        this.w = WSConnection
        this.w.onopen = (evt) => { /* self.w.send('MESSAGE;ident;'+this.state.user.id) */ }
        this.w.onmessage = (evt) => {
            self = this
            /**
             * WEBSOCKET BROKER... might want to put it somewhere else
             */
            // We only get ident immediately after connect
            let [reason, what, data] = evt.data.split(';')
            // We send user ID and hash as ident immediately back
            if(what=='ident') self.w.send(`MESSAGE;ident;${data};${this.state.user.id}`)
            // We reload orders if needed
            if(what=='reload' & data == 'orders')
                // We actually have to
                orders.get()
                .then(o => {
                    this.state.user.orders = o
                    this.updateNav(this.state.value[0])
                    // we actually have to update user's ledgers too
                    user_data.get().then(r => this.state.user.ledgers = r.ledgers)
                })
            
            // Then run anything that should be run on feed
            self.state.ws.forEach(f => f(evt.data))

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
            if(!value[asset]) return
            value[asset] = [v, value[asset][0]]
        })
        this.setState({value})

        // calculate additional order values
        let user = this.state.user
        user.orders = user.orders.map(o => self.calcOrderDetails(self, o))
        this.setState({user})

        // Update upper portion of screen with data
        this.updateNav(v)
    }

    // calculate some values for template later on
    calcOrderDetails(self, order) {
        order.percent_gain = (self.state.value.COIN[0] / order.open_value - 1) * 100  // 100% ok
        order.earnings = (self.state.value.COIN[0] - order.open_value) * (order.direction ? 1 : -1)
        order.amount_in_quote = order.amount / order.open_value // 100% ok
        order.distance_to_open = self.state.value.COIN[0] - order.open_value
        return order
    }

    
    updateNav(v) {
        // Get open trades
        let open_trades = this.state.user.orders.filter(o => 
            o.open != null && o.status == true
        )
        // if we have no open trades, we leave
        if(open_trades.length == 0) {
            let nav = this.state.user.ledgers[0].value
            let gain = 0
            this.setState({nav})
            this.setState({gain})
            return
        }
        // Calculate total gain and amounts
        let total_amounts = open_trades.reduce((a,v) => {return a + v.amount}, 0)
        let gain = open_trades.reduce((a,v) => {return a + v.earnings}, 0)

        let nav = this.state.user.ledgers[0].value + total_amounts + gain
        this.setState({nav})
        this.setState({gain})
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
                        <small class="">Current gain:</small>
                        <div class="f-ledger"><h3>{this.state.gain.toFixed(4)}</h3> <span>EUR</span></div>
                        <hr />
                        <small class="">Current COIN value</small>
                        {Object.keys(this.state.value).map(k =>
                            <div class="f-ledger"><h3>{this.state.value[k][0].toFixed(4)}</h3> <span>EUR</span></div>
                        )}
                    </div>
                </div>
                

                < SidebarNewOrder value={this.state.value.COIN[0]} user={this.state.user}/>

                <SidebarOrders user={this.state.user} />


            </div>
        )
    }

}

export default Sidebar
