import React, {Component} from 'react'
import TimePicker from 'react-time-picker'

class HeatMapTimePicker extends Component{
    state = {
        time:'10:00'
    };

    onChange = time => this.setState({time})

    render(){
        return(
            <TimePicker
                style={{zIndex:999}}
                onChange={this.onChange}
                value={this.state.time}
            />
        )
    }
}

export default HeatMapTimePicker;