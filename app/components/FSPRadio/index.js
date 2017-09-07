import React, { Component } from 'react'

function compare (a, b) {
  if (a.count < b.count) {
    return 1
  }
  if (a.count > b.count) {
    return -1
  }
  return 0
}

export default class FSPRadio extends Component {
  constructor (params) {
    super(params)
    // initial selected state set from props
    this.state = {
      selected: this.props.selected,
      multiSelected: []
    }
    this.setSelected = this.setSelected.bind(this)
  }

  setSelected (value) {
    const {multi = false} = this.props
    const {multiSelected = []} = this.state
    const newMulti = [...multiSelected]
    const len = multiSelected.length
    if (multiSelected.indexOf(value) === -1) {
      if (len === 2) {
        newMulti[0] = newMulti[1]
        newMulti[1] = value
      } else if (len === 1 || len === 0) {
        newMulti.push(value)
      }
    }
    const newValue = {
      selected: value,
      multiSelected: multi ? newMulti : [value]
    }
    this.setState(newValue)
    this.props.onChange(newValue)
  }

  onClear (e) {
    e.preventDefault()
    this.setState({
      selected: undefined,
      multiSelected: []
    })
    this.props.onChange(undefined)
  }

  componentWillReceiveProps (nextProps) {
    const {sortOrder} = nextProps
    if (sortOrder)
      this.setState({sortOrder})
  }

  render () {
    const {selected, multiSelected = [], sortOrder} = this.state
    const {data = [], title, id} = this.props
    const isSelected = (value) => multiSelected.indexOf(value) >= 0
    const selectorStyle = {
      width: '90%',
      border: '1px solid rgba(38,35,35,0.5)',
      height: 140,
      color: 'white',
      backgroundColor: 'rgba(38,35,35,0.5)',
      padding: 5,
      margin: '0 auto'
    }
    const clearStyle = {
      display: 'inline-block',
      float: 'right',
      color: '#6DCDCB',
      fontWeight: 'normal'
    }
    const dataList = sortOrder || data
    return (
      <div style={selectorStyle}>
        <div style={{fontWeight: 'bold'}}>{title}:&nbsp;&nbsp;<label style={{color: 'white'}}>{selected}</label>
          <a href="#" style={clearStyle} onClick={this.onClear.bind(this)}>Clear</a>
        </div>
        <div style={{overflow: 'auto', height: 'calc(100% - 25px)', marginTop: 5}}>
          {dataList.map(({name, label, count}) => {
            return <Option
              key={name}
              checked={isSelected(name)}
              onClick={() => {this.setSelected(name)}}
              name={name}
              label={label}
              count={count}
            />
          })}
        </div>

      </div>
    )
  }
}

const Option = (props) => {
  const selColor = '#6DCDCB'
  const valueDiv = {
    height: 4,
    width: '95%',
    backgroundColor: selColor
  }
  const {name, label, count, checked, onClick} = props
  const noOfAgents = count ? count.toLocaleString() : count
  return (
    <div onClick={onClick} style={{cursor: 'pointer'}}>
      <div style={{width: '95%'}}>
        <label style={{cursor: 'pointer', color: checked ? selColor : 'white'}}>{label || name}</label>
        <label style={{float: 'right', color: checked ? selColor : 'white'}}>{noOfAgents}</label>
      </div>
      <div style={{...valueDiv, backgroundColor: checked ? selColor : 'gray'}} onClick={onClick}/>
    </div>
  )
}
