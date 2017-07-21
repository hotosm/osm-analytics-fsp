import React, { Component } from 'react'
import Modal from 'react-modal'
import * as request from 'superagent'
import { queue } from 'd3-queue'

class ContributorsModal extends Component {
  state = {
    howMany: 10,
    loading: false
  }

  userNames = {}

  render() {
    const total = this.props.contributors.reduce((prev, contributor) => prev + contributor.contributions, 0)
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        className={this.state.loading ? 'updating' : ''}
        style={this.props.style}>
        <h3>Top {Math.min(this.state.howMany, this.props.contributors.length)} Contributors</h3>
        <a className="close-link" onClick={this.props.onRequestClose}>x</a>
        <ul className="contributors">
        {this.props.contributors.slice(0,this.state.howMany).map(contributor =>
          <li key={contributor.uid}>{this.userNames[contributor.uid]
            ? (<a href={"http://hdyc.neis-one.org/?"+this.userNames[contributor.uid]} target="_blank" title="get more infos about this user on hdyc">{this.userNames[contributor.uid]}</a>)
            : '#'+contributor.uid}
            <span className='percentage'>{Math.round(contributor.contributions/total*100) || '<1'}%</span>
          </li>
        )}
          <li>{this.props.contributors.length > this.state.howMany
            ? <button onClick={::this.expand}>show more</button>
            : ''}
          </li>
        </ul>
      </Modal>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isOpen) return
    this.loadUserNamesFor(nextProps.contributors.slice(0,10).map(contributor => contributor.uid))
    this.setState({ howMany: 10 })
  }

  expand() {
    this.loadUserNamesFor(this.props.contributors.slice(this.state.howMany,this.state.howMany+10).map(contributor => contributor.uid))
    this.setState({
      howMany: this.state.howMany + 10
    })
  }

  loadUserNamesFor(uids) {
    this.setState({ loading: true })
    var q = queue()
    var uidsToRequest = uids.filter(uid => !this.userNames[uid])

    uidsToRequest.forEach(uid => {
      let req = request.get('http://whosthat.osmz.ru/whosthat.php?action=last&id='+uid)
      q.defer(req.end.bind(req))
    })
    q.awaitAll(function(err, data) {
      if (err) {
        console.error(err)
      } else {
        uidsToRequest.forEach((uid, idx) => {
          this.userNames[uid] = data[idx].body[0]
        })
      }
      this.setState({ loading: false })
    }.bind(this))
  }
}

export default ContributorsModal
