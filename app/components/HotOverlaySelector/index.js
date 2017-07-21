import React, { Component } from 'react'
import DropdownButton from '../DropdownButton'


class HotOverlaySelector extends Component {
  render() {
    var options = [{
      id: 'hotoverlay',
      description: 'Show HOT projects on map'
    }]
    var btn = <span className="descriptor">HOT Projects&ensp;▾</span>
    return (
      <DropdownButton
        options={options}
        multiple={true}
        btnElement={btn}
        selectedKeys={this.props.hotOverlayEnabled ? ['hotoverlay'] : []}
        onSelectionChange={::this.handleDropdownChanges}
        className="overlays-dropdown"
      />
    )
  }

  handleDropdownChanges(selectedKeys) {
    if (selectedKeys[0] === 'hotoverlay') {
      this.props.enableHotOverlay()
    } else {
      this.props.disableHotOverlay()
    }
  }
}

export default HotOverlaySelector
