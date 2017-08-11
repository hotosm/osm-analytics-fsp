/**
 * FSPBar
 * Created by Timothy on 21-Jul-17.
 */
import React, {Component} from "react";
import {connect} from 'react-redux'
import "rc-slider/assets/index.css";
import "./style.css";
import RangeSelector from "../RangeSelector";
import {bindActionCreators} from 'redux'
import * as MapActions from '../../actions/map'
import * as StatsActions from '../../actions/stats'
import {controls as config} from "../../settings/fspSettings";
class FSPBar extends Component {
    constructor(props) {
        super(props);
        const {routeParams: {country, question}} = props;
        this.state = {
            data: config[country][question]
        };
    }

    componentWillReceiveProps(nextProps) {
        const {routeParams} = nextProps;
        if (routeParams !== this.props.routeParams) {
            this.loadControls(routeParams);
        }
    }

    loadControls({country, question}) {

        this.setState({data: config[country][question]});
    }

    onRangeChanged(country, question, id, selection) {
        const data = config[country][question];
        const controls = data.controls.map(ctr => {
            if (ctr.id === id) {
                const range = {...ctr.range,selection};
                return {...ctr, range};
            } else
                return {...ctr};
        });
        this.setState({data: {...data, controls}});
        this.props.statsActions.setFSPFilter({country, question, id, selection});
    }

    render() {
        const {country, question} = this.props.routeParams;
        const {data: {title, controls}} = this.state;
        return <div id="fspbar">
            <div style={{color: 'white', fontSize: 24, padding: 15, paddingBottom: 0}}>
                <span>{title}</span>
            </div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                alignContent: 'space-between'
            }}>
                {
                    controls.map(({type, title, label, range, id}) => {
                        return (
                            <div key={id} style={{width: 350, margin: 10}}>
                                <RangeSelector title={title}
                                               label={label}
                                               range={range}
                                               onSelectionChanged={(range) => {
                                                   this.onRangeChanged(country, question, id, range);
                                               }}
                                />
                            </div>
                        );
                    })
                }
            </div>
        </div>
    }
}



function mapStateToProps(state) {
    return {
        map: state.map,
        stats: state.stats
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(MapActions, dispatch),
        statsActions: bindActionCreators(StatsActions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FSPBar)