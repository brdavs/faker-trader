import cookie from 'cookie'
import Login from './login'
import Dashboard from './dashboard'



function FakerTrader({ children }) {

	let cookies = cookie.parse(document.cookie)
	let authenticated = cookies.faker_trader_session ? true : false

    return (
		<div class="faker_trader">
			{authenticated ? 
				<Dashboard /> :
				<Login />
			}
			
		</div>
    )
}

export default FakerTrader