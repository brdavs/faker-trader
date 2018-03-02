import Component from 'inferno-component'
import cookie from 'cookie'
import { users, orders, user_data } from './resources'
import Sidebar from './sidebar'
import MainContent from './main'

export class Dashboard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			user: {},
		};
    }

    componentWillMount() {
        user_data.get()
        .then(user => this.setState({user}))
    }

    render() {
        return (
            <div class="f-dashboard">

                {/* Top bar */}
                <div class="pure-g f-top-bar">
                    <div class="pure-u-1">
                        <div class="f-pad">

                            <div class="f-bar-item">
                                <img class="f-avatar" src={`http://api.adorable.io/avatars/128/${this.state.user.username}`} />
                                {this.state.user.username}
                            </div>
                            <div class="pure-menu pure-menu-horizontal f-top-menu">
                                <ul class="pure-menu-list">
                                    <li class="pure-menu-item">
                                        <a href="#" class="pure-menu-link" onClick={this.logout()}>Log out</a>
                                    </li>
                                </ul>
                            </div>
                            <div class="spacer" style="clear: both;"></div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div class="pure-g">

                    {/* Side bar */}
                    <div class="pure-u-1 pure-u-md-1-3 pure-u-lg-1-4 pure-u-xl-1-5">
                        {this.state.user.id ?
                            <Sidebar user={this.state.user} />
                        : null}
                    </div>

                    {/* Central area */}
                    <div class="pure-u-1 pure-u-md-2-3 pure-u-lg-3-4 pure-u-xl-4-5">
                        <div class="f-pad">
                            {this.state.user.id ?
                                <MainContent />
                            : null}
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    /**
     * Custom methods
     */
    logout() {
        return (e) => {
            e.preventDefault()
            let fake = cookie.parse(document.cookie).faker_trader_session
            if(fake)
                document.cookie = `faker_trader_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            window.location.replace('/')
        }
    }
}

export default Dashboard