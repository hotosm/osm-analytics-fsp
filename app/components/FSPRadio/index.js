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

  render () {
    const {selected} = this.state
    const {data = [], title} = this.props

    return (
      <div style={{width: 250, border: '1px solid green',height: 150}}>
        {title}:&nbsp;&nbsp;<label style={{color: 'white'}}>{selected}</label>
        <div style={{overflow: 'auto', height: 120}}>
          {data.map(({name}) => {
            return <div>
              <input
                type="radio"
                checked={selected === name}
                onClick={() => {this.setSelected(name)}}
                value={name}/> {name}
            </div>
          })}
        </div>

      </div>
    )
  }
}