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
      selected: this.props.selected
    }
    this.setSelected = this.setSelected.bind(this)
  }

  setSelected (value) {
    this.setState({
      selected: value
    })
    this.props.onChange(value)
  }

  onClear (e) {
    e.preventDefault()
    this.setState({
      selected: undefined
    })
    this.props.onChange(undefined)
  }

  render () {
    const {selected} = this.state
    const {data = [], title, id, bankSortOrder} = this.props

    const selectorStyle = {
      width: 300,
      border: '1px solid rgba(38,35,35,0.5)',
      height: 150,
      color: 'white',
      backgroundColor: 'rgba(38,35,35,0.5)',
      padding: 5
    }
    const clearStyle = {
      display: 'inline-block',
      float: 'right',
      color: '#6DCDCB',
    }
    let bankData = undefined
    if (bankSortOrder) {
      const {bankCounts, atmCounts} = bankSortOrder
      if (id.indexOf('atm') >= 0) {
        bankData = atmCounts
      } else if (bankSortOrder) {
        bankData = bankCounts
      }
    }
    const dataList = bankData || data
    return (
      <div style={selectorStyle}>
        <div style={{fontWeight: 'bold'}}>{title}:&nbsp;&nbsp;<label style={{color: 'white'}}>{selected}</label>
          <a href="#" style={clearStyle} onClick={this.onClear.bind(this)}>Clear</a>
        </div>
        <div style={{overflow: 'auto', height: 120, marginTop: 5}}>
          {dataList.map(({name, count}) => {
            return <Option
              key={name}
              checked={selected === name}
              onClick={() => {this.setSelected(name)}}
              name={name}
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
    height: 6,
    width: '95%',
    backgroundColor: selColor
  }
  const {name, count, checked, onClick} = props
  const noOfAgents = count ? count.toLocaleString() : count
  return (
    <div onClick={onClick} style={{cursor: 'pointer'}}>
      <div style={{width:'95%'}}>
        <label style={{cursor: 'pointer', color: checked ? selColor : 'white'}}>{name}</label>
        <label style={{float: 'right', color: checked ? selColor : 'white'}}>{noOfAgents}</label>
      </div>
      <div style={{...valueDiv, backgroundColor: checked ? selColor : 'gray'}} onClick={onClick}/>
    </div>
  )
}
