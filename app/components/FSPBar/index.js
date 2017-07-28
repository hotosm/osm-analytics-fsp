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
        console.log("On range changed", {country, question, id, selection});
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
        console.log("Route Params",this.props.routeParams);
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
                            <div style={{width: 350, margin: 10}}>
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

const config = {
    uganda: {
        mobilemoney: {
            title: 'Mobile money agents in relation to population and economic activity',
            controls: [
                {
                    id: 'peoplePerAgent',
                    type: 'range',
                    title: 'People per agent',
                    label: 'people',
                    range: {max: 1000, min: 0, selection: [300, 750]}
                },
                {
                    id: 'population',
                    type: 'range',
                    title: 'Population density',
                    label: 'people/cell (,000)',
                    range: {max: 10, min: 0, selection: [2, 6]}
                },
                {
                    id: 'economic',
                    type: 'range',
                    title: 'Economic activity',
                    label: '(1 : Low , 8 : High)',
                    range: {max: 8, min: 0, selection: [2, 4]}
                }
            ]
        },
        qn2: {
            title: 'Show mobile money agents that are (at least) a distance from a bank or ATM',
            controls: [
                {
                    id: "distance-from-bank",
                    type: 'range',
                    title: 'Distance from banks',
                    label: '(,000 meters)',
                    range: {max: 1000, min: 0, selection: [300, 750]}
                },
                {
                    id: "distance-from-atm",
                    type: 'range',
                    title: 'Distance from ATM',
                    label: '(,000 meters)',
                    range: {max: 10, min: 0, selection: [2, 6]}
                }
            ]
        },
        qn3: {
            title: 'Show location of selected banks in relation to population density and economic activity',
            controls: [
                {
                    id: 'population',
                    type: 'range',
                    title: 'Population density',
                    label: 'people/cell (,000)',
                    range: {max: 10, min: 0, selection: [2, 6]}
                },
                {
                    id: 'economic',
                    type: 'range',
                    title: 'Economic activity',
                    label: '(1 : Low , 8 : High)',
                    range: {max: 8, min: 0, selection: [2, 4]}
                }
            ]
        },
        qn4: {
            title: 'Show location of Banks/ ATMs in relation to population density ',
            controls: []
        }
    },
    kenya: {},

};

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