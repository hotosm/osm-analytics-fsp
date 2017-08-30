/**
 *
 * Created by Timothy on 21-Jul-17.
 */
import React, { Component } from 'react'
import { area, bboxPolygon, erase, centroid } from 'turf'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import request from 'superagent'
import * as MapActions from '../../actions/map'
import * as StatsActions from '../../actions/stats'
import { debounce } from 'lodash'
import regionToCoords from '../Map/regionToCoords'
import Legend from '../Legend'
import { controls as fspControls, selectedBanks } from '../../settings/fspSettings'
import { getRandomColor, getBankName, generateBankColors } from './fspUtils'
import settings from '../../settings/settings'
// leaflet plugins
import '../../libs/leaflet-heat.js'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import glStyles from '../Map/glstyles'
import './style.css'

const bankColors = generateBankColors()
var map // Leaflet map object
var glLayer // mapbox-gl layer
var glCompareLayers // mapbox-gl layers for before/after view
var boundsLayer = null // selected region layer
var moveDirectly = false

Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda))
}
const defaultRange = [0, 100000]

class FSPMap extends Component {
  filters = {
    bankFilter: undefined,
    atmFilter: undefined,
    bankRange: defaultRange,// Read values from config, but this can work well
    atmRange: defaultRange,// Read values from config, but this can work well
  }
  state = {}
  bankData = undefined
  markers = undefined
  populationLayer = undefined

  render () {
    const {country, question} = this.props.routeParams
    let layers = glStyles([question]).layers
    const legendTitle = fspControls[country][question]['legend']
    return <div className="fspView">
      <div id="map">
      </div>
      <Legend
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
    if (this.markers)
      map.removeLayer(this.markers)
    if (this.populationLayer) {
      map.removeLayer(this.populationLayer)
    }
  }

  getMyStyle () {
    const style = {
      'version': 8,
      'sources': {
        'osm-population-raw': {
          'type': 'vector',
          'tiles': [
            'http://192.168.128.155:7778/population/{z}/{x}/{y}.pbf'
          ],
          'minzoom': 0,
          'maxzoom': 14
        }
      },
      'layers': [
        {
          'id': 'population-raw-aggregated',
          '_description': 'Building',
          'type': 'fill',
          'source': 'osm-population-raw',
          'source-layer': 'population',
          'paint': {'fill-color': '#eee8f3', 'fill-opacity': 0.5, 'fill-outline-color': '#ffffff'},
          'filter': ['all', ['>=', 'Popn_count', 0], ['<', 'Popn_count', 5]]
        }
      ]
    }
    const base = style.layers[0]
    style.layers.push(
      this.makeStyle(1, base, 5, 100, '#eee8f3'),
      this.makeStyle(2, base, 100, 200, '#ccbadc'),
      this.makeStyle(3, base, 200, 300, '#aa8cc5'),
      this.makeStyle(4, base, 300, 400, '#885ead'),
      this.makeStyle(5, base, 400, 500, '#663096'),
      this.makeStyle(6, base, 500, 10000, '#44146f')
    )
    return style
  }

  makeStyle (id, base, start, end, color) {
    return {
      ...base,
      id: `${base.id}-${id}`,
      'paint': {
        'fill-color': color, 'fill-opacity': 0.5, 'fill-outline-color': '#ffffff'
      },
      'filter': [
        'all', ['>=', 'Popn_count', start], ['<', 'Popn_count', end]
      ]
    }
  }

  loadBankData () {
    if (this.bankData) {
      this.createBankLayer(this.bankData)
    } else
      request
        .get('http://192.168.128.155:7778/bankatmdata')
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

  createBankLayer (bankData, filter) {
    if (this.markers)
      map.removeLayer(this.markers)
    const data = {...bankData}
    data.features = data.features.map(feature => {
      if (feature.geometry.type !== 'Point')
        return centroid(feature)
      else return feature
    })

    if (filter) {
      data.features = data.features.filter(feature => {
        const name = getBankName(feature.properties._name)
        return name === filter
      })
    }
    this.markers = L.markerClusterGroup({
      disableClusteringAtZoom: 14
    })
    const geoJsonLayer = L.geoJson(data, {
      pointToLayer: (feature, latlng) => {
        const name = getBankName(feature.properties._name)
        const color = bankColors[name]
        return new L.circleMarker(latlng, {
          radius: 6,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        })
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties._name)
      }
    })
    this.markers.addLayer(geoJsonLayer)
    map.addLayer(this.markers)

    const counts = {}
    data.features.forEach(feature => {
      const name = getBankName(feature.properties._name)
      if (!counts[name])
        counts[name] = 1
      else
        counts[name] += 1
    })

    const bankCounts = Object.keys(counts).map(key => {return {name: key, count: counts[key]}})
    bankCounts.sort((a, b) => {
      if (a.count < b.count)
        return 1;
      else if (a.count > b.count)
        return -1;
      else
        return 0;
    })
    console.log('Counts', bankCounts)
    this.props.statsActions.setBankSortOder({bankCounts, atmCounts:[]})
  }

  loadMapStyle ({country, question}) {
    this.removeCustomLayers()
    glLayer._glMap.setStyle(glStyles([question]), {diff: false})
    const range = this.filters.bankRange
    if (question === 'mmdistbanks')
      this.sortBanksAndATMs(range[0], range[1])
    if (question === 'popnbankatm') {
      this.populationLayer = L.mapboxGL({
        updateInterval: 0,
        style: this.getMyStyle(),
        hash: false
      })
      //.addTo(map)
      setTimeout(() => {
        this.loadBankData()
      }, 1000)
    }
  }

  focusOnRegion (region) {
    // TODO Send this to settings
    const _region = 'polygon:{isbEcr|Tzmi@mmi@rvq@xyWheaA}|T~tbAvcm@tbZli}EagkBxkr@hbdGt`kGwfAtur@~~n@nzqAzm]xnpF_tOvrn@mk^wyMkl_@|qZqleAqjiAufqA_fOklhRrtA|_CwwuEmpqB}|yD{xx@yn_@c{d@wftA|wEgw}CpbaByjrCoEi`jAxlx@add@tm`@eosAxl{Axq|AhpsAecRlmsBdxRlbv@|wm@'
    this.props.actions.setRegionFromUrl(_region)
  }

  createHeatPoints (data) {
    const processFeature = ({geometry: {coordinates}}) => {
      return [coordinates[1], coordinates[0], 0.7]
    }
    const processFeatureCollection = (coll) => {
      return coll.features.map(processFeature)
    }
    const processGeoGSON = (obj) => {
      if (obj.type === 'FeatureCollection') {
        return processFeatureCollection(obj)
      } else {
        return [processFeature(obj)]
      }
    }
    let points = []
    if (Array.isArray(data)) {
      points = data.flatMap(processGeoGSON)
    } else {
      points = processGeoGSON(data)
    }
    return points
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
    const {question, id, choice} = filter
    if (question === 'mmdistbanks') {
      const controls = fspControls[country][question]['controls']
      const control = controls.filter(cnt => cnt.id === id)[0]
      let suffix = control.field
      let choiceRange = choice ? `${suffix}${choice}` : undefined
      if (suffix.indexOf('_bank_') >= 0) {
        this.filters = {...this.filters, bankFilter: choiceRange || '_distanceFromBank'}
        this.setFilter({...filter, selection: this.filters.bankRange}, routeParams)
      } else {
        this.filters = {...this.filters, atmFilter: choiceRange || '_distanceFromATM'}
        this.setFilter({...filter, selection: this.filters.atmRange}, routeParams)
      }
    } else if (question === 'popnbankatm') {
      console.log('Filters on qn 3', choice)
      this.createBankLayer(this.bankData, choice)
    }

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
          this.props.statsActions.setBankSortOder({bankCounts, atmCounts})
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