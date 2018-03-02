import fetchival from 'fetchival'
import {hasClass, addClass, removeClass} from './manipulators'


const users = fetchival('/api/users', {
    // xhrFields: { withCredentials: true },
    credentials: 'same-origin'
})

const orders = fetchival('/api/orders', {
    // xhrFields: { withCredentials: true },
    credentials: 'same-origin'
})

const user_data = fetchival('/api/user_data', {
    // xhrFields: { withCredentials: true },
    credentials: 'same-origin'
})

var WSConnection = new WebSocket('ws://localhost:7334')
WSConnection.onclose = (evt) => {
    console.log('Socket closed down. Attempting to reconnect.', evt)
    // Not working in reality
    // Need to actualy reload app for this, because all redraws are triggered
    // Through messaging.
    // setInterval(()=> {
    //     if(WSConnection.readyState!=1)
    //         WSConnection = new WebSocket('ws://localhost:7334')
    // }, 5000)
}

/**
 * Technically these are not resources, but just helpers
 * did not know where to put this
 */

function toggleVisibility(e, id, kls) {
    // Table classes
    document.querySelectorAll(`.${kls}`)
        .forEach(e => addClass(e, 'hidden'))
    let el = document.getElementById(id)
    removeClass(el, 'hidden')
    // Button classes
    let ul = e.srcElement.parentElement.parentElement
    ul.querySelectorAll('li').forEach(el => 
        removeClass(el, 'pure-menu-selected')
    )
    addClass(e.srcElement.parentElement, 'pure-menu-selected')
}

function transformDate(d) {
    d = new Date(d)
    return `${d.toLocaleDateString('en-US')} at ${d.toLocaleTimeString('sl-SI')}`
}


export {users, orders, user_data, WSConnection, transformDate, toggleVisibility}