/**
 *
 * Created by Timothy on 21-Jul-17.
 */
import React, { Component } from 'react'
import { area, bboxPolygon, erase } from 'turf'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import request from 'superagent'
import * as MapActions from '../../actions/map'
import * as StatsActions from '../../actions/stats'
import { debounce } from 'lodash'
import regionToCoords from '../Map/regionToCoords'
import Legend from '../Legend'
import { controls as fspControls } from '../../settings/fspSettings'
import settings from '../../settings/settings'
// leaflet plugins
import '../../libs/leaflet-heat.js'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import glStyles from '../Map/glstyles'
import './style.css'
import { selectedBanks } from '../../settings/fspSettings.js'

var map // Leaflet map object
var glLayer // mapbox-gl layer
var glCompareLayers // mapbox-gl layers for before/after view
var boundsLayer = null // selected region layer
var moveDirectly = false

Array.prototype.flatMap = function (lambda) {
  return Array.prototype.concat.apply([], this.map(lambda))
}

class FSPMap extends Component {
  state = {
    bankFilter: undefined,
    atmFilter: undefined,
    bankRange: [0, 100000],// Read values from config, but thos can work well
    atmRange: [0, 100000],// Read values from config, but thos can work well
  }

  render () {
    const {country, question} = this.props.routeParams
    const layers = glStyles([question]).layers
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

  loadMapStyle ({country, question}) {
    glLayer._glMap.setStyle(glStyles([question]), {diff: false})
    const range  = this.state.bankRange;
    if (question === 'mmdistbanks')
      this.sortBanksAndATMs(range[0],range[1])
  }

  focusOnRegion (region) {
    // Send this to settings
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
    const {country} = routeParams
    const {question, id, selection, category} = filter
    const layers = glStyles([question]).layers.filter(l => l.id.match(/aggregated/))

    const controls = fspControls[country][question]['controls']
    const control = controls.filter(cnt => cnt.id === id)[0]

    const {bankFilter, atmFilter} = this.state
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
        this.setState({bankRange: selection})
      }
      // Remove other atm filters
      if (id.indexOf('atm') >= 0) {
        newFilter = this.removeFilter(newFilter, '_atm_')
        newFilter = this.removeFilter(newFilter, '_distanceFromATM')
        this.setState({atmRange: selection})
      }
      const filter = [...newFilter, ['>=', property, selection[0]], ['<=', property, selection[1]]]
      glLayer._glMap.setFilter(layer.id, filter)
    })

    if (question === 'mmdistbanks')
      this.sortBanksAndATMs(selection[0], selection[1])
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
          console.log('On results')
          const {bankCounts, atmCounts} = res.body
          console.log('On results', {bankCounts, atmCounts})
          this.props.statsActions.setBankSortOder({bankCounts, atmCounts})
        }
      })
  }

  removeFilter (filters, like) {
    return filters.filter(f => {
      return !Array.isArray(f) || (f[1].indexOf(like) === -1)
    })
  }

  setFilterChoice (filter, routeParams) {
    const {country} = routeParams
    const {question, id, choice, category} = filter
    const controls = fspControls[country][question]['controls']
    const control = controls.filter(cnt => cnt.id === id)[0]
    let suffix = control.field
    let choiceRange = choice ? `${suffix}${choice}` : undefined
    if (suffix.indexOf('_bank_') >= 0) {
      this.setState({bankFilter: choiceRange})
      //this.setFilter({...filter, selection: this.state.bankRange}, routeParams)
    } else {
      this.setState({atmFilter: choiceRange})
      //this.setFilter({...filter, selection: this.state.atmRange}, routeParams)
    }
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