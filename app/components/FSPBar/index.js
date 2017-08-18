/**
 * FSPBar
 * Created by Timothy on 21-Jul-17.
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'rc-slider/assets/index.css'
import './style.css'
import RangeSelector from '../RangeSelector'
import FSPRadio from '../FSPRadio'
import { bindActionCreators } from 'redux'
import * as MapActions from '../../actions/map'
import * as StatsActions from '../../actions/stats'
import { controls as config } from '../../settings/fspSettings'

class FSPBar extends Component {
  constructor (props) {
    super(props)
    const {routeParams: {country, question}} = props
    this.state = {
      data: config[country][question],
      bankSortOrder: undefined
    }
    this.mySelectors = {}
  }

  onRangeChanged (country, question, id, selection, category) {
    const data = config[country][question]
    const controls = data.controls.map(ctr => {
      if (ctr.id === id) {
        const range = {...ctr.range, selection}
        return {...ctr, range}
      } else
        return {...ctr}
    })
    this.setState({data: {...data, controls}})
    this.props.statsActions.setFSPFilter({country, question, id, selection, category})
    if (question === 'mmdistbanks') {
      const otherSelector = Object.keys(this.mySelectors)
        .filter(key => key !== id)
        .map(key => this.mySelectors[key])[0]
      const oSelection = otherSelector.state.selection
      const oMin = oSelection[0]
      const oMax = oSelection[1]
      const min = selection[0]
      const max = selection[1]
      if (oMin >= max || min >= oMax) {
        otherSelector.resetSelection()
      }
    }

  }

  onChoiceChanged (country, question, id, choice, category) {
    this.props.statsActions.setFSPFilterChoice({country, question, id, choice, category})
  }

  render () {
    const {routeParams: {country, question}, stats} = this.props
    const {title, controls} = config[country][question]
    return <div id="fspbar" style={{overflow: 'auto'}}>
      <div style={{color: 'white', fontWeight: 'bold', fontSize: 20, padding: 15, paddingBottom: 0}}>
        <span>{title}</span>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignContent: 'space-between',
        minWidth: 1280
      }}>
        {
          controls.map(({type, title, label, range, id, data, category}) => {
            if (type === 'range') {
              return (
                <div key={id} style={{width: 350, margin: 10}}>
                  <RangeSelector title={title}
                                 label={label}
                                 range={range}
                                 ref={r => {
                                   this.mySelectors[id] = r
                                 }}
                                 onSelectionChanged={(range) => {
                                   this.onRangeChanged(country, question, id, range, category)

                                 }}
                  />
                </div>
              )
            }
            else {
              return (
                <div key={id} style={{fontWeight: 'normal'}}>
                  <FSPRadio data={data} title={title} bankSortOrder={stats.bankSortOrder} id={id}
                            onChange={(choice) => {
                              this.onChoiceChanged(country, question, id, choice, category)
                            }}
                  />
                </div>
              )
            }
          })
        }
      </div>
    </div>
  }
}

function mapStateToProps (state) {
  return {
    map: state.map,
    stats: state.stats
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(MapActions, dispatch),
    statsActions: bindActionCreators(StatsActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FSPBar)