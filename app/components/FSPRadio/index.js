import React, { Component } from 'react'

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
    const {data = [], title} = this.props
    const selectorStyle = {
      width: 250,
      border: '1px solid rgba(38,35,35,0.5)',
      height: 150,
      color: 'white',
      backgroundColor: 'rgba(38,35,35,0.5)',
      padding: 5
    }
    const clearStyle = {
      display: 'inline-block',
      float: 'right',
      color: 'green',
    }
    return (
      <div style={selectorStyle}>
        {title}:&nbsp;&nbsp;<label style={{color: 'white'}}>{selected}</label>
        <a href="#" style={clearStyle} onClick={this.onClear.bind(this)}>Clear</a>
        <div style={{overflow: 'auto', height: 120, marginTop: 5}}>
          {data.map(({name}) => {
            /*
            return <div>
              <input
                type="radio"
                checked={selected === name}
                onClick={() => {this.setSelected(name)}}
                value={name}/> {name}
            </div>
            */
            return <Option
              checked={selected === name}
              onClick={() => {this.setSelected(name)}}
              name={name}
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
  const {name, checked, onClick} = props
  return (
    <div>
      <label>{name}</label><br/>
      <div style={{...valueDiv, backgroundColor: checked ? selColor : 'gray'}} onClick={onClick}/>
    </div>
  )
}
