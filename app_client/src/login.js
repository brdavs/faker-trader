import Component from 'inferno-component'
import { users, orders } from './resources'

export class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            users: [],
            user: {username: ''},
        };
    }

    componentWillMount() {
        users.get().then(users => this.setState({users}))


    }

    render() {

        return (
            <div class="pure-g f-login">
                <div class="pure-u-1 pure-u-md-2-3">
                
                    <div class="f-pad">
                        <div class="f-login-form">
                            <h3>New trader youngling:</h3>
                            <form class="pure-form">
                                <fieldset>
                                    <input type="text" placeholder="Username" onInput={this.updateUsername()}  />
                                </fieldset>
                                <button type="submit" class="pure-button pure-button-primary" onClick={this.login()}>Create</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="pure-u-1 pure-u-md-1-3">
                    <div class="f-pad">
                        {this.state.users.length ?
                            <h3>Avid trader younglings</h3>
                        :null}
                        <ul class="f-user-list">
                            {this.state.users.map(user =>
                                <li>
                                    <div class="f-user" onClick={this.getUser(user.id)}>
                                        <img class="f-avatar" src={`http://api.adorable.io/avatars/128/${user.username}`} />
                                        {user.username}
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Custom methods
     */
    updateUsername() {
        let self = this
        return (e) => {
            this.setState({user: e.target.value})
        }
    }

    login() {
        let self = this
        return (e) => {
            e.preventDefault()
            users.post({username: self.state.user})
                .then(user => 
                    self.setState({user})
                )
                .then(() => 
                    users(self.state.user.id).get()
                )
                .then(r => window.location.replace('/'))
                // .then(users => self.setState({users}))
        }
    }

    getUser(id) {
        let self = this
        return (e) => {
            users(id).get()
                .then(user => { self.setState({user})})
                .then(r => window.location.replace('/'))
        }
    }
}

export default Login