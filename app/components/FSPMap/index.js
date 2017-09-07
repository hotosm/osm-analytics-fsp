/**
 *
 * Created by Timothy on 21-Jul-17.
 */
import React, { Component } from 'react'
import { area, bboxPolygon, centroid, erase } from 'turf'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import request from 'superagent'
import * as MapActions from '../../actions/map'
import * as StatsActions from '../../actions/stats'
import { debounce } from 'lodash'
import regionToCoords from '../Map/regionToCoords'
import Legend from '../Legend'
import { controls as fspControls } from '../../settings/fspSettings'
import { generateBankColors, getBankName, classifyData, getFeatureName, getRandomColor } from './fspUtils'
import { createStyle } from '../Map/glstyles/fsp-style'

import settings from '../../settings/settings'
// leaflet plugins
import '../../libs/leaflet-heat.js'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import glStyles from '../Map/glstyles'
import './style.css'

const bankColors = generateBankColors()
let map // Leaflet map object
let glLayer // mapbox-gl layer
let glCompareLayers // mapbox-gl layers for before/after view
let boundsLayer = null // selected region layer
let moveDirectly = false

Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda))
}
const defaultRange = [0, 100000]
const MyLegend = ({data = []}) => {
  const iconStyle = {
    height: 10, width: 10, display: 'inline-block',
    backgroundColor: 'blue',
    padding: 0
  }
  return (
    <ul style={{padding: 0}}>
      <label style={{color: 'black', fontSize: 14}}>Bank Grouping</label>
      {data.map(({name, color}) => {
        return <li key={name}><span style={{...iconStyle, backgroundColor: color}}/>&nbsp;&nbsp;{name}</li>
      })}
    </ul>
  )
}

class FSPMap extends Component {
  filters = {
    bankFilter: undefined,
    atmFilter: undefined,
    bankRange: defaultRange,// Read values from config, but this can work well
    atmRange: defaultRange,// Read values from config, but this can work well

  }
  state = {
    customLegend: undefined//Customised legend for special questions
  }
  bankData = undefined
  fspData = undefined
  currFSP = undefined
  markers = []

  render () {
    const {country, question} = this.props.routeParams
    let layers = glStyles([question]).layers
    const legendTitle = fspControls[country][question]['legend']
    return <div className="fspView">
      <div id="map">
      </div>
      <Legend
        customLegend={this.state.customLegend}
        title={legendTitle}
        showHighlight={false}
        layers={layers}
        featureType={question}
        zoom={this.state.mapZoomLevel}
        hotOverlayEnabled={false}
      />
    </div>
  }

  setCustomRegion () {
    if (!boundsLayer) return
    this.props.actions.setRegion({
      type: 'polygon',
      coords: L.polygon(boundsLayer.getLatLngs()[1]).toGeoJSON().geometry.coordinates[0].slice(0, -1)
    })
  }

  componentDidMount () {
    const {country, question} = this.props.routeParams
    map = L.map(
      'map', {
        editable: true,
        minZoom: 2
      })
      .setView([0, 35], 2)
    map.zoomControl.setPosition('bottomright')
    map.on('editable:editing', debounce(::this.setCustomRegion, 200))
    map.on('zoomend', (e) => {
      this.setState({mapZoomLevel: map.getZoom()})
    })

    const mapbox_token = 'pk.eyJ1IjoiaG90IiwiYSI6ImNpbmx4bWN6ajAwYTd3OW0ycjh3bTZvc3QifQ.KtikS4sFO95Jm8nyiOR4gQ'
    L.tileLayer('https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
      attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      zIndex: -1
    }).addTo(map)
    // Pass proper value
    this.focusOnRegion('')
    if (!mapboxgl.supported()) {
      alert('This browser does not support WebGL which is required to run this application. Please check that you are using a supported browser and that WebGL is enabled.')
    }
    glLayer = L.mapboxGL({
      updateInterval: 0,
      style: glStyles([question]),
      hash: false
    }).addTo(map)
    this.loadMapStyle({country, question})
  }

  removeCustomLayers () {
    this.markers.forEach(layer => {
      map.removeLayer(layer)
    })
  }

  loadBankData () {
    if (this.bankData) {
      this.createBankLayer(this.bankData)
    } else
      request
        .get(`${settings['vt-source']}/bankatmdata`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err)
            console.error(err)
          else {
            this.bankData = res.body
            this.createBankLayer(this.bankData)
          }
        })
  }

  createFSPMap (fspData, fsp, filters) {
    this.removeCustomLayers()
    const data = {...fspData}
    data.features = data.features.map(feature => {
      if (feature.geometry.type !== 'Point')
        return centroid(feature)
      else return feature
    })

    const pointToLayer = (feature, latlng) => {
      const name = getBankName(feature)
      const color = getRandomColor()
      return new L.circleMarker(latlng, {
        radius: 6,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      })
    }
    const onEachFeature = (feature, layer) => {
      layer.bindPopup(feature.properties.name||"Unknown")
    }

    if (filters) {
      const colors = {},classNames={}
      colors[filters[0]] = 'greenyellow'
      classNames[filters[0]]='my-div-icon-1'
      if (filters[1]) {
        colors[filters[1]] = 'yellow'
        classNames[filters[1]]='my-div-icon-2'
      }
      filters.forEach(filter => {
        const layerData = {...data}
        layerData.features = layerData.features.filter(feature => {
          const name = getFeatureName(feature, fsp)
          return filter === name
        })

        const markerLayer = L.markerClusterGroup({
          disableClusteringAtZoom: 14,
          iconCreateFunction: function (cluster) {
            return L.divIcon({
              html: `<div class="my-div-content">${cluster.getChildCount()}</div>`,
              className: classNames[filter],
              iconSize: L.point(40, 40)
            })
          }
          //Customize here
        })
        markerLayer.addLayer(L.geoJson(layerData, {
          pointToLayer, onEachFeature
        }))
        map.addLayer(markerLayer)
        this.markers.push(markerLayer)
      })
      this.setState({
        customLegend: <MyLegend data={filters.map(f => {return {name: f, color: colors[f]}})}/>
      })
    } else {
      const markerLayer = L.markerClusterGroup({
        disableClusteringAtZoom: 14
      })
      markerLayer.addLayer(L.geoJson(data, {
        pointToLayer, onEachFeature
      }))
      map.addLayer(markerLayer)
      this.markers.push(markerLayer)
      this.setState({
        customLegend: undefined
      })
    }
    const sortedData = classifyData(fspData, fsp)
    this.props.statsActions.setSortOder({sortedData, sortId: 'qn4-operator-selector'})
  }

  // TODO This method can be removed
  createBankLayer (bankData, filters) {
    this.removeCustomLayers()
    const data = {...bankData}
    data.features = data.features.map(feature => {
      if (feature.geometry.type !== 'Point')
        return centroid(feature)
      else return feature
    })

    const pointToLayer = (feature, latlng) => {
      const name = getBankName(feature)
      const color = bankColors[name]
      return new L.circleMarker(latlng, {
        radius: 6,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      })
    }
    const onEachFeature = (feature, layer) => {
      layer.bindPopup(feature.properties._name || 'No Name')
    }

    if (filters) {
      const colors = {},classNames={}
      colors[filters[0]] = 'greenyellow'
      classNames[filters[0]]='my-div-icon-1'
      if (filters[1]) {
        colors[filters[1]] = 'yellow'
        classNames[filters[1]]='my-div-icon-2'
      }
      filters.forEach(filter => {
        const layerData = {...data}
        layerData.features = layerData.features.filter(feature => {
          const name = getBankName(feature)
          return filter === name
        })

        const markerLayer = L.markerClusterGroup({
          disableClusteringAtZoom: 14,
          iconCreateFunction: function (cluster) {
            return L.divIcon({
              html: `<div class="my-div-content">${cluster.getChildCount()}</div>`,
              className: classNames[filter],
              iconSize: L.point(40, 40)
            })
          }
          //Customize here
        })
        markerLayer.addLayer(L.geoJson(layerData, {
          pointToLayer, onEachFeature
        }))
        map.addLayer(markerLayer)
        this.markers.push(markerLayer)
      })
      this.setState({
        customLegend: <MyLegend data={filters.map(f => {return {name: f, color: colors[f]}})}/>
      })
    } else {
      const markerLayer = L.markerClusterGroup({
        disableClusteringAtZoom: 14
      })
      markerLayer.addLayer(L.geoJson(data, {
        pointToLayer, onEachFeature
      }))
      map.addLayer(markerLayer)
      this.markers.push(markerLayer)
      this.setState({
        customLegend: undefined
      })
    }

    // =====================
    const counts = {}
    bankData.features.forEach(feature => {
      const name = getBankName(feature)
      if (!counts[name])
        counts[name] = 1
      else
        counts[name] += 1
    })

    const bankCounts = Object.keys(counts).map(key => {return {name: key, count: counts[key]}})
    bankCounts.sort((a, b) => {
      if (a.count < b.count)
        return 1
      else if (a.count > b.count)
        return -1
      else
        return 0
    })
    const display = []
    const len = bankCounts.length - 2
    for (let i = 2; i < len; i++) {
      display.push(bankCounts[i])
    }
    display.push(bankCounts[1])
    display.push(bankCounts[0])
    this.props.statsActions.setSortOder({sortedData: display, sortId: 'qn3-distance-selector-bank'})
  }

  loadMapStyle ({country, question}) {
    this.removeCustomLayers()
    glLayer._glMap.setStyle(glStyles([question]), {diff: false})
    const range = this.filters.bankRange
    if (question === 'mmdistbanks')
      this.sortBanksAndATMs(range[0], range[1])
    if (question === 'popnbankatm') {
      setTimeout(() => {
        this.loadBankData()
      }, 100)
    }
  }

  focusOnRegion (region) {
    // TODO Send this to settings
    const _region = 'polygon:{isbEcr|Tzmi@mmi@rvq@xyWheaA}|T~tbAvcm@tbZli}EagkBxkr@hbdGt`kGwfAtur@~~n@nzqAzm]xnpF_tOvrn@mk^wyMkl_@|qZqleAqjiAufqA_fOklhRrtA|_CwwuEmpqB}|yD{xx@yn_@c{d@wftA|wEgw}CpbaByjrCoEi`jAxlx@add@tm`@eosAxl{Axq|AhpsAecRlmsBdxRlbv@|wm@'
    this.props.actions.setRegionFromUrl(_region)
  }

  componentWillReceiveProps (nextProps) {
    // check for changed map parameters
    if (nextProps.map.region !== this.props.map.region) {
      this.mapSetRegion(nextProps.map.region)
    }
    if (nextProps.stats.fspFilter !== this.props.stats.fspFilter) {
      this.setFilter(nextProps.stats.fspFilter, nextProps.routeParams)
    }
    if (nextProps.stats.fspFilterChoice !== this.props.stats.fspFilterChoice) {
      this.setFilterChoice(nextProps.stats.fspFilterChoice, nextProps.routeParams)
    }
    if (nextProps.routeParams !== this.props.routeParams) {
      this.loadMapStyle(nextProps.routeParams)
      this.focusOnRegion('')
    }
  }

  setFilter (filter, routeParams) {
    console.log('Setting filter', filter)
    const {country} = routeParams
    const {question, id, selection} = filter
    const layers = glStyles([question]).layers.filter(l => l.id.match(/aggregated/))

    const controls = fspControls[country][question]['controls']
    const control = controls.filter(cnt => cnt.id === id)[0]

    const {bankFilter, atmFilter, bankRange, atmRange} = this.filters
    const filterField = id.indexOf('bank') >= 0 ? bankFilter : atmFilter

    let property = filterField || control.field
    const layerIds = []
    layers.forEach(layer => {
      const currentFilter = glLayer._glMap.getFilter(layer.id) || []
      layerIds.push(layer.id)

      let newFilter = this.removeFilter(currentFilter, property)
      // Remove other bank filters
      if (id.indexOf('bank') >= 0) {
        newFilter = this.removeFilter(newFilter, '_bank_')
        newFilter = this.removeFilter(newFilter, '_distanceFromBank')
        if (selection[1] <= atmRange[0] || selection[0] >= atmRange[1]) {
          // Invalid range clear atm selection
          newFilter = this.removeFilter(newFilter, '_distanceFromATM')
          this.filters.atmRange = defaultRange
        }
        this.filters = {...this.filters, bankRange: selection}
      }
      // Remove other atm filters
      if (id.indexOf('atm') >= 0) {
        newFilter = this.removeFilter(newFilter, '_atm_')
        newFilter = this.removeFilter(newFilter, '_distanceFromATM')
        if (selection[1] <= bankRange[0] || selection[0] >= bankRange[1]) {
          // Invalid range clear atm selection
          newFilter = this.removeFilter(newFilter, '_distanceFromBank')
          this.filters.atmRange = defaultRange
        }
        this.filters = {...this.filters, atmRange: selection}
      }
      const filter = [...newFilter, ['>=', property, selection[0]], ['<=', property, selection[1]]]
      glLayer._glMap.setFilter(layer.id, filter)
    })

    if (question === 'mmdistbanks')
      this.sortBanksAndATMs(selection[0], selection[1])
  }

  setFilterChoice (filter, routeParams) {
    const {country} = routeParams
    const {question, id, choice = {}} = filter
    const {selected, multiSelected} = choice
    if (question === 'mmdistbanks') {
      const controls = fspControls[country][question]['controls']
      const control = controls.filter(cnt => cnt.id === id)[0]
      let suffix = control.field
      let choiceRange = selected ? `${suffix}${selected}` : undefined
      if (suffix.indexOf('_bank_') >= 0) {
        this.filters = {...this.filters, bankFilter: choiceRange || '_distanceFromBank'}
        this.setFilter({...filter, selection: this.filters.bankRange}, routeParams)
      } else {
        this.filters = {...this.filters, atmFilter: choiceRange || '_distanceFromATM'}
        this.setFilter({...filter, selection: this.filters.atmRange}, routeParams)
      }
    } else if (question === 'popnbankatm') {
      console.log('Filters on qn 3', multiSelected)
      this.createBankLayer(this.bankData, multiSelected)
    } else if (question === 'fspdistribution') {
      if (id === 'fsp-selector') {
        console.log('Switch FSP type', choice)
        if (selected) {
          this.loadFSP(selected)
        }
        else
          this.removeCustomLayers()
      } else if (id === 'qn4-operator-selector') {
        console.log('Switch Operator', choice)
        this.createFSPMap(this.fspData, this.currFSP, multiSelected)
      }
    }
  }

  loadFSP (fspType) {
    const server = settings['vt-source']
    const path = `${server}/json/${fspType}.json`
    console.log(path)
    request
      .get(path)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error('Oh no! error', err)
        } else {
          this.fspData = res.body
          this.currFSP = fspType
          const newStyle = createStyle(fspType)
          glLayer._glMap.setStyle(newStyle, {diff: false})
          this.createFSPMap(this.fspData, fspType)
        }
      })
  }

  sortBanksAndATMs (min, max) {
    request
      .get(`${settings['vt-source']}/bankatm/${min}/${max}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.error('Oh no! error', err)
        } else {
          const {bankCounts, atmCounts} = res.body
          this.props.statsActions.setSortOder({sortedData: bankCounts, sortId: 'qn2-distance-selector-bank'})
          this.props.statsActions.setSortOder({sortedData: atmCounts, sortId: 'qn2-distance-selector-atm'})
        }
      })
  }

  removeFilter (filters, like) {
    return filters.filter(f => {
      return !Array.isArray(f) || (f[1].indexOf(like) === -1)
    })
  }

  mapSetRegion (region) {
    if (boundsLayer !== null) {
      map.removeLayer(boundsLayer)
    }
    if (region === null) return
    boundsLayer = L.polygon(
      [[[-85.0511287798, -1E5], [85.0511287798, -1E5], [85.0511287798, 2E5], [-85.0511287798, 2E5], [-85.0511287798, -1E5]]]
        .concat(regionToCoords(region, 'leaflet')), {
        weight: 1,
        color: 'gray',
        interactive: false
      }).addTo(map)
    boundsLayer.enableEdit()
    // set map view to region
    try { // geometry calculcation are a bit hairy for invalid geometries (which may happen during polygon editing)
      let viewPort = bboxPolygon(map.getBounds().toBBoxString().split(',').map(Number))
      let xorAreaViewPort = erase(viewPort, L.polygon(boundsLayer.getLatLngs()[1]).toGeoJSON())
      let fitboundsFunc
      if (moveDirectly) {
        fitboundsFunc = ::map.fitBounds
        moveDirectly = false
      } else if (
        !xorAreaViewPort // new region fully includes viewport
        || area(xorAreaViewPort) > area(viewPort) * (1 - 0.01) // region is small compared to current viewport (<10% of the area covered) or feature is outside current viewport
      ) {
        fitboundsFunc = ::map.flyToBounds
      } else {
        fitboundsFunc = () => {
        }
      }
      fitboundsFunc(
        L.polygon(boundsLayer.getLatLngs()[1]).getBounds(), // zoom to inner ring!
        {
          paddingTopLeft: [20, 10 + 52],
          paddingBottomRight: [20, 10 + 140]
        })
    } catch (e) {
    }
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
)(FSPMap)