import React, { Component } from 'react'
import * as request from 'superagent'
import moment from 'moment'
import style from './style.css'
import { filters as featureTypeOptions } from '../../settings/options'
import settings from '../../settings/settings'

function compare(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}
class Legend extends Component {
  state = {}

  render () {
    const {showHighlight = true, layers,title="Map Legend"} = this.props
    const featureTypeDescription = featureTypeOptions.find(f => f.id === this.props.featureType).description
    const iconStyle = {
      height: 10, width: 10, display: 'inline-block',
      backgroundColor: 'blue'
    }
    const legendEntries = []
    if (this.props.zoom > 13) {
      legendEntries.push(
        <li key="0"><span className={'legend-icon feature ' + this.props.featureType}></span>{featureTypeDescription}
        </li>,
      )
      if (showHighlight)
        legendEntries.push(
          <li key="1"><span
            className={'legend-icon feature highlight ' + this.props.featureType}></span>Highlighted {featureTypeDescription.toLowerCase()}
          </li>
        )
    } else {
      if(layers){
        layers.sort(compare)
        layers.forEach(({id, filter, paint}) => {
          const from = filter[1][2]
          const to = filter[2] ? filter[2][2] : '.'
          const label = `${from}   to  ${to}`
          legendEntries.push(
            <li key={id}><span style={{...iconStyle, backgroundColor: paint['fill-color']}}/>&nbsp;&nbsp;{label}</li>
          )
        })
      }
      if (!layers)
        legendEntries.push(
          <li key="2"><span className={'legend-icon high ' + this.props.featureType}></span>High density
            of {featureTypeDescription.toLowerCase()}</li>,
          <li key="3"><span className={'legend-icon mid ' + this.props.featureType}></span>Medium density
            of {featureTypeDescription.toLowerCase()}</li>,
          <li key="4"><span className={'legend-icon low ' + this.props.featureType}></span>Low density
            of {featureTypeDescription.toLowerCase()}</li>,
        )

      if (showHighlight)
        legendEntries.push(
          <li key="5"><span className={'legend-icon highlight ' + this.props.featureType}></span>Area with mostly
            highlighted {featureTypeDescription.toLowerCase()}</li>
        )
    }
    if (this.props.hotOverlayEnabled) {
      legendEntries.push(
        <li key="6"><span className={'legend-icon hot-projects'}></span>HOT project outline</li>
      )
    }
    return (

      <ul id="legend">
        <li><h3>{title}</h3></li>
        {legendEntries}
        <li>Last Data Update: {this.state.lastModified
          ? <span title={this.state.lastModified}>{moment(this.state.lastModified).fromNow()}</span>
          : ''
        }</li>
      </ul>
    )
  }

  componentDidMount () {
    this.updateLastModified(this.props.featureType)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.featureType !== this.props.featureType) {
      this.updateLastModified(nextProps.featureType)
    }
  }

  updateLastModified (featureType) {
    request.head(settings['vt-source'] + '/' + featureType + '/0/0/0.pbf').end((err, res) => {
      if (!err) this.setState({
        lastModified: res.headers['last-modified']
      })
    })
  }

}

export default Legend
