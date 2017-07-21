import React, { Component } from 'react'
import Header from '../../components/Header'
import Map from '../../components/Map'
import Stats from '../../components/Stats'
import CompareBar from '../../components/CompareBar'
import { load as loadHotProjects } from '../../data/hotprojects.js'
import style from './style.css'

class App extends Component {
  state = {
    hotProjectsLoaded: false
  }

  render() {
    const { actions, routeParams, route } = this.props
    if (!this.state.hotProjectsLoaded) {
      return (
        <div className="main">
          <Header/>
        </div>
      )
      return <p style="text-align:center;">Loading…</p>
    }
    return (
      <div className="main">
        <Header/>
        <Map
          region={routeParams.region}
          filters={routeParams.filters}
          overlay={routeParams.overlay}
          times={routeParams.times}
          view={route.view}
        />
        {route.view === 'country' ? <Stats mode={routeParams.overlay}/> : ''}
        {route.view === 'compare' ? <CompareBar times={routeParams.times}/> : ''}
      </div>
    )
  }

  componentDidMount() {
    loadHotProjects((err) => {
      if (err) {
        console.error('unable to load hot projects data: ', err)
      }
      this.setState({ hotProjectsLoaded: true })
    })
  }
}

export default App
