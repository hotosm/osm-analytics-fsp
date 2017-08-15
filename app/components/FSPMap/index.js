/**
 *
 * Created by Timothy on 21-Jul-17.
 */
import React, { Component } from 'react'
import { area, bboxPolygon, erase } from 'turf'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as MapActions from '../../actions/map'
import * as StatsActions from '../../actions/stats'
import { debounce } from 'lodash'
import regionToCoords from '../Map/regionToCoords'
import Legend from '../Legend'
import { controls as fspControls } from '../../settings/fspSettings'
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
  }

  render () {
    const {country, question} = this.props.routeParams
    const layers = glStyles([question]).layers.filter(l => l.id.match(/aggregated/))
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
    const {question} = this.props.routeParams
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

    const region = 'polygon:{isbEcr|Tzmi@mmi@rvq@xyWheaA}|T~tbAvcm@tbZli}EagkBxkr@hbdGt`kGwfAtur@~~n@nzqAzm]xnpF_tOvrn@mk^wyMkl_@|qZqleAqjiAufqA_fOklhRrtA|_CwwuEmpqB}|yD{xx@yn_@c{d@wftA|wEgw}CpbaByjrCoEi`jAxlx@add@tm`@eosAxl{Axq|AhpsAecRlmsBdxRlbv@|wm@'
    this.props.actions.setRegionFromUrl(region)

    if (!mapboxgl.supported()) {
      alert('This browser does not support WebGL which is required to run this application. Please check that you are using a supported browser and that WebGL is enabled.')
    }
    glLayer = L.mapboxGL({
      updateInterval: 0,
      style: glStyles([question]),
      hash: false
    }).addTo(map)
    this.addPopupOnClick(question)
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
    }
  }

  loadMapStyle ({country, question}) {
    glLayer._glMap.setStyle(glStyles([question]), {diff: false})
    this.addPopupOnClick(question)
  }

  addPopupOnClick (question) {
    map.on('click', function (e) {
      const glMap = glLayer._glMap
      const point = e.layerPoint
      // to target only some layers, change the options, see documentation:
      // { layers: ['my-layer-name'] }
      // https://www.mapbox.com/mapbox-gl-js/api/
      console.log(point)
      const options = {}
      const features = glMap.queryRenderedFeatures([point.x, point.y], options)
      features.forEach(f => {
        console.log(f.properties)
      })
    })
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
      }

      // Remove other atm filters
      if (id.indexOf('atm') >= 0) {
        newFilter = this.removeFilter(newFilter, '_atm_')
        newFilter = this.removeFilter(newFilter, '_distanceFromATM')
      }
      const filter = [...newFilter, ['>=', property, selection[0]], ['<=', property, selection[1]]]
      glLayer._glMap.setFilter(layer.id, filter)
    })
    const features = glLayer._glMap.queryRenderedFeatures({layers: layerIds})
    //const props = features.map(f => f.properties)
    const min = selection[0]
    const max = selection[1]
    const banks = selectedBanks.map(bank => {
      const key = `_bank_${bank.name}`
      const bankDistances = features.map(({properties}) => properties[key])
      const valid = bankDistances.filter(dist => (dist >= min && dist < max))
      return {...bank, count: valid.length}
    })

    this.props.statsActions.setBankSortOder(banks);
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
    } else {
      this.setState({atmFilter: choiceRange})
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