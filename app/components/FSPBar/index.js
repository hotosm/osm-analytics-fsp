/**
 * FSPBar
 * Created by Timothy on 21-Jul-17.
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import 'rc-slider/assets/index.css'
import './style.css'
import RangeSelector from '../RangeSelector'
import FSPRadio from '../FSPRadio'
import { bindActionCreators } from 'redux'
import * as MapActions from '../../actions/map'
import * as StatsActions from '../../actions/stats'
import { controls as config } from '../../settings/fspSettings'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
}

class FSPBar extends Component {
  constructor (props) {
    super(props)
    const {routeParams: {country, question}} = props
    this.state = {
      data: config[country][question],
      bankSortOrder: undefined,
      isOpen: false,
    }
    this.mySelectors = {}
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  openModal () {
    this.setState({
      isOpen: true,
    })
  }

  closeModal () {
    this.setState({
      isOpen: false,
    })
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
    this.props.statsActions.setFSPRangeFilter({country, question, id, selection, category})

    if (question === 'mmdistbanks') {
      const otherSelector = Object.keys(this.mySelectors)
        .filter(key => key !== id)
        .map(key => this.mySelectors[key])[0]
      if (!otherSelector)
        return
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
    this.props.statsActions.setFSPChoiceFilter({country, question, id, choice, category})
  }

  render () {
    const {routeParams: {country, question}, stats} = this.props
    const {sortedData, sortId} = stats.sortOrder || {}
    const {title, controls,tooltip:{body}} = config[country][question]

    const percent = controls.length === 4 ? 20 : (controls.length === 3 ? 30 : 40)
    const InfoBtn = () => <label ref={ref => {this.info = ref}} style={{
      fontSize: 14,
      display: 'inline-block',
      color: 'white',
      width: 12,
      height: 16,
      border: '2px solid white',
      borderRadius: 15,
      padding: '0 4px 5px',
      textAlign: 'center',
      cursor: 'pointer'
    }}
     onClick={() => {
       this.openModal()
     }}
    >{'i'}</label>
    return <div id="fspbar" style={{overflow: 'auto'}}>
      <Modal
        isOpen={this.state.isOpen}
        style={customStyles}
        aria={{
          labelledby: 'heading',
          describedby: 'full_description'
        }}>

        <h4 id="heading" style={{marginTop: 0, marginBottom: 3}}>Information</h4>
        <div id="full_description" style={{maxWidth: 400}} dangerouslySetInnerHTML={{ __html: body }}/>
        <div>
          <button onClick={this.closeModal} style={{float: 'right'}}>Close</button>
        </div>
      </Modal>
      <div style={{color: 'white', fontWeight: 'bold', fontSize: 20, padding: 15, paddingBottom: 0}}>
        <span>{title}</span>&nbsp;&nbsp;<InfoBtn/>&nbsp;&nbsp;&nbsp;&nbsp;<span
        style={{fontSize: 14, fontWeight: 'normal'}}>Disclaimer: <i>todo get this from Alyssa</i></span>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignContent: 'flex-start',
        minWidth: 1280,
        fontSize: 16
      }}>
        {
          controls.map(({type, title, label, range, id, data, category, divisor, multi}) => {
            if (type === 'range') {
              return (
                <div key={id} style={{width: `${percent}%`, margin: 10}}>
                  <RangeSelector title={title}
                                 label={label}
                                 range={range}
                                 divisor={divisor}
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
                <div key={id} style={{fontWeight: 'normal', width: `${percent}%`, margin: 10}}>
                  <FSPRadio data={data} title={title} sortOrder={sortId === id ? sortedData : undefined} id={id}
                            multi={multi}
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