import cookie from 'cookie'
import Login from './login'
import Dashboard from './dashboard'



function FakerTrader({ children }) {

	let cookies = cookie.parse(document.cookie)
	let authenticated = cookies.faker_trader_session ? true : false

    return (
		<div class="faker_trader">
			{!authenticated ? <div id="particles-js"></div> : <div id="particles-js" style="display: none;"></div>} { /* Amusement bit */}
			{authenticated ? 
				<Dashboard /> :
				<Login />
			}
			
		</div>
    )
}

export default FakerTrader