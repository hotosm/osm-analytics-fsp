/**
 * Created by Timothy on 24-Jul-17.
 */
import React, {Component} from 'react'
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import './style.css'

const sampleData = (min, max) => {
    const ticks = {};
    ticks[min] = min;
    ticks[max * 0.25] = max * 0.25;
    ticks[max * 0.5] = max * 0.5;
    ticks[max * 0.75] = max * 0.75;
    ticks[max] = max;
    return ticks;
};
class RangeSelector extends Component {


    render() {
        const handleStyle = {
            cursor: 'e-resize',
            borderRadius: 0,
            width: 2,
            marginLeft: -1,
            height: 40,
            borderWidth: 1,
            marginTop: -30,
            backgroundColor: 'rgb(188, 227, 233)'
        };

        const trackStyle = {
            backgroundColor: 'red'
        };
        const railStyle = {
            borderRadius: 0,
            height: 2
        };
        const dotStyle = {
            width: 2,
            borderRadius: 0,
            marginLeft: -2,
            height: 25,
            borderWidth: 1,
        };
        const holder = {};

        const titleStyle = {
            color: 'white',
            marginBottom: 35,
            marginTop: 30
        };

        const {title, range: {max, min, selection}, label = '', onSelectionChanged} = this.props;
        return <div style={holder}>
            <div style={titleStyle}>
                <span>{title}:</span>&nbsp;&nbsp;
                <span style={{color: 'limegreen', fontSize: 14}}>{`${selection[0]} to ${selection[1]} ${label}` }</span>
            </div>
            <Range
                min={min}
                max={max}
                defaultValue={selection}
                pushable
                //onChange={onSelectionChanged}
                onAfterChange={onSelectionChanged}
                handleStyle={[
                    handleStyle,
                    handleStyle
                ]}
                trackStyle={trackStyle}
                railStyle={railStyle}
                dotStyle={dotStyle}
                marks={sampleData(min, max)}
            />
        </div>
    }
}


export default RangeSelector;