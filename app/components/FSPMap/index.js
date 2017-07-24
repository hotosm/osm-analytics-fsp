/**
 * Created by Timothy on 21-Jul-17.
 */
import React, {Component} from "react";
import {area, bboxPolygon, erase} from "turf";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as MapActions from '../../actions/map'
import {debounce} from "lodash";
import regionToCoords from '../Map/regionToCoords'
// leaflet plugins
import style from './style.css'
var map // Leaflet map object
var glLayer // mapbox-gl layer
var glCompareLayers // mapbox-gl layers for before/after view
var boundsLayer = null // selected region layer
var moveDirectly = false

class FSPMap extends Component {
    state = {};
    render() {
        return <div className="fspView">
            <div id="map">
            </div>
        </div>
    }
    setCustomRegion() {
        if (!boundsLayer) return;
        this.props.actions.setRegion({
            type: 'polygon',
            coords: L.polygon(boundsLayer.getLatLngs()[1]).toGeoJSON().geometry.coordinates[0].slice(0,-1)
        })
    }
    componentDidMount() {
        map = L.map(
            'map', {
                editable: true,
                minZoom: 2
            })
            .setView([0, 35], 2);
        map.zoomControl.setPosition('bottomright');
        map.on('editable:editing', debounce(::this.setCustomRegion, 200));
        map.on('zoomend', (e) => { this.setState({ mapZoomLevel:map.getZoom() }) });

        const mapbox_token = 'pk.eyJ1IjoiaG90IiwiYSI6ImNpbmx4bWN6ajAwYTd3OW0ycjh3bTZvc3QifQ.KtikS4sFO95Jm8nyiOR4gQ';
        L.tileLayer('https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
            attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            zIndex: -1
        }).addTo(map);

        const region = "polygon:{isbEcr|Tzmi@mmi@rvq@xyWheaA}|T~tbAvcm@tbZli}EagkBxkr@hbdGt`kGwfAtur@~~n@nzqAzm]xnpF_tOvrn@mk^wyMkl_@|qZqleAqjiAufqA_fOklhRrtA|_CwwuEmpqB}|yD{xx@yn_@c{d@wftA|wEgw}CpbaByjrCoEi`jAxlx@add@tm`@eosAxl{Axq|AhpsAecRlmsBdxRlbv@|wm@";
        this.props.actions.setRegionFromUrl(region);
    }

    componentWillReceiveProps(nextProps) {
        // check for changed map parameters
        if (nextProps.map.region !== this.props.map.region) {
            this.mapSetRegion(nextProps.map.region)
        }
    }
    mapSetRegion(region) {
        if (boundsLayer !== null) {
            map.removeLayer(boundsLayer)
        }
        if (region === null) return;
        boundsLayer = L.polygon(
            [[[-85.0511287798,-1E5],[85.0511287798,-1E5],[85.0511287798,2E5],[-85.0511287798,2E5],[-85.0511287798,-1E5]]]
                .concat(regionToCoords(region, 'leaflet')), {
                weight: 1,
                color: 'gray',
                interactive: false
            }).addTo(map);
        boundsLayer.enableEdit();
        // set map view to region
        try { // geometry calculcation are a bit hairy for invalid geometries (which may happen during polygon editing)
            let viewPort = bboxPolygon(map.getBounds().toBBoxString().split(',').map(Number));
            let xorAreaViewPort = erase(viewPort, L.polygon(boundsLayer.getLatLngs()[1]).toGeoJSON());
            let fitboundsFunc;
            if (moveDirectly) {
                fitboundsFunc = ::map.fitBounds;
                moveDirectly = false
            } else if (
                !xorAreaViewPort // new region fully includes viewport
                || area(xorAreaViewPort) > area(viewPort)*(1-0.01) // region is small compared to current viewport (<10% of the area covered) or feature is outside current viewport
            ) {
                fitboundsFunc = ::map.flyToBounds
            } else {
                fitboundsFunc = () => {}
            }
            fitboundsFunc(
                L.polygon(boundsLayer.getLatLngs()[1]).getBounds(), // zoom to inner ring!
                {
                    paddingTopLeft: [20, 10+52],
                    paddingBottomRight: [20, 10+140]
                })
        } catch(e) {}
    }
}

function mapStateToProps(state) {
    return {
        map: state.map,
        stats: state.stats
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(MapActions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FSPMap)