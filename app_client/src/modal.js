import Component from 'inferno-component'
import {hasClass, addClass, removeClass} from './manipulators'

export class Modal extends Component {
	constructor(props) {
        super(props)
		this.state = {
            content: props.content
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.content != this.state.content)
            this.setState({content: this.state.content})
    }

    close() {
        this.setState({content: null})
    }


    render() {
        let modal = null
        if(this.state.content && this.state.content.message)
            modal = (
                <div class="f-modal">
                    <div class="f-window">
                        <h2>Notice: </h2>
                        {this.state.content.message}
                        <div class="f-buttonbar">
                            <button class="pure-button pure-button-primary" onClick={(e)=>{this.close()}}>Ok</button>
                        </div>
                    </div>
                    
                </div>
            )


        return modal
    }

}

export default Modal