/**
 *
 * Created by Timothy on 21-Jul-17.
 */
import React, {Component} from "react";
import {area, bboxPolygon, erase} from "turf";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as MapActions from "../../actions/map";
import {debounce} from "lodash";
import regionToCoords from "../Map/regionToCoords";
import Legend from '../Legend'
// leaflet plugins
import "../../libs/leaflet-heat.js";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import glStyles from "../Map/glstyles";
import "./style.css";
var map // Leaflet map object
var glLayer // mapbox-gl layer
var glCompareLayers // mapbox-gl layers for before/after view
var boundsLayer = null // selected region layer
var moveDirectly = false

Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};

class FSPMap extends Component {
    state = {};

    render() {
        const {question} = this.props.routeParams;
        return <div className="fspView">
            <div id="map">
            </div>
            <Legend
                showHighlight={false}
                featureType={question}
                zoom={this.state.mapZoomLevel}
                hotOverlayEnabled={false}
            />
        </div>
    }

    setCustomRegion() {
        if (!boundsLayer) return;
        this.props.actions.setRegion({
            type: 'polygon',
            coords: L.polygon(boundsLayer.getLatLngs()[1]).toGeoJSON().geometry.coordinates[0].slice(0, -1)
        })
    }

    componentDidMount() {
        const {question} = this.props.routeParams;
        map = L.map(
            'map', {
                editable: true,
                minZoom: 2
            })
            .setView([0, 35], 2);
        map.zoomControl.setPosition('bottomright');
        map.on('editable:editing', debounce(::this.setCustomRegion, 200));
        map.on('zoomend', (e) => {
            this.setState({mapZoomLevel: map.getZoom()})
        });

        const mapbox_token = 'pk.eyJ1IjoiaG90IiwiYSI6ImNpbmx4bWN6ajAwYTd3OW0ycjh3bTZvc3QifQ.KtikS4sFO95Jm8nyiOR4gQ';
        L.tileLayer('https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + mapbox_token, {
            attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            zIndex: -1
        }).addTo(map);

        const region = "polygon:{isbEcr|Tzmi@mmi@rvq@xyWheaA}|T~tbAvcm@tbZli}EagkBxkr@hbdGt`kGwfAtur@~~n@nzqAzm]xnpF_tOvrn@mk^wyMkl_@|qZqleAqjiAufqA_fOklhRrtA|_CwwuEmpqB}|yD{xx@yn_@c{d@wftA|wEgw}CpbaByjrCoEi`jAxlx@add@tm`@eosAxl{Axq|AhpsAecRlmsBdxRlbv@|wm@";
        this.props.actions.setRegionFromUrl(region);

        if (!mapboxgl.supported()) {
            alert('This browser does not support WebGL which is required to run this application. Please check that you are using a supported browser and that WebGL is enabled.')
        }
        glLayer = L.mapboxGL({
            updateInterval: 0,
            style: glStyles([question]),
            hash: false
        }).addTo(map);

        // Change the cursor to a pointer when the mouse is over the places layer.
        glLayer._glMap.on('mouseenter', 'places', function () {
            glLayer._glMap.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        glLayer._glMap.on('mouseleave', 'places', function () {
            glLayer._glMap.getCanvas().style.cursor = '';
        });
        this.addPopupOnClick(question);
        /*
         request
         .get('http://127.0.0.1:8080/mmout.json')
         .set('Accept', 'application/json')
         .end((err, res)=> {
         if (err)
         console.error(err);
         else {
         const data = res.body;
         const markers = L.markerClusterGroup();
         const geoJsonLayer = L.geoJson(data, {
         onEachFeature: function (feature, layer) {
         layer.bindPopup(feature.properties.address);
         }
         });
         markers.addLayer(geoJsonLayer);
         const heatData = this.createHeatPoints(data);
         const heat = L.heatLayer(heatData, {radius: 12}).addTo(map);
         //map.addLayer(markers);
         }
         });
         */
    }

    createHeatPoints(data) {
        const processFeature = ({geometry: {coordinates}}) => {
            return [coordinates[1], coordinates[0], 0.7];
        };
        const processFeatureCollection = (coll) => {
            return coll.features.map(processFeature);
        };
        const processGeoGSON = (obj) => {
            if (obj.type === 'FeatureCollection') {
                return processFeatureCollection(obj);
            } else {
                return [processFeature(obj)];
            }
        };
        let points = [];
        if (Array.isArray(data)) {
            points = data.flatMap(processGeoGSON);
        } else {
            points = processGeoGSON(data);
        }
        return points;
    }

    componentWillReceiveProps(nextProps) {
        console.log("FSP map will recive props", {n: nextProps.routeParams, o: this.props.routeParams});
        // check for changed map parameters
        if (nextProps.map.region !== this.props.map.region) {
            this.mapSetRegion(nextProps.map.region)
        }
        if (nextProps.stats.fspFilter !== this.props.stats.fspFilter) {
            this.setFilter(nextProps.stats.fspFilter)
        }
        if (nextProps.routeParams !== this.props.routeParams) {
            this.loadMapStyle(nextProps.routeParams);
        }
    }

    loadMapStyle({country, question}) {
        console.log("New map to load", {country, question});
        glLayer._glMap.setStyle(glStyles([question]), {diff: false});
        this.addPopupOnClick(question);
    }

    addPopupOnClick(question){
        const layers = glStyles([question]).layers.filter(l => l.id.match(/aggregated/)).map(layer=>layer.id);
        console.log("Setting click on layers: ",layers);
        layers.forEach(layer=>{
            glLayer._glMap.on('click', layer, function (e) {
                console.log("On Click",e);
                const pop = new mapboxgl.Popup()
                    .setLngLat(e.features[0].geometry.coordinates)
                    .setHTML(e.features[0].properties.description)
                    .addTo(glLayer._glMap);
            });
        });
    }

    setFilter(filter) {
        const {question, id, selection} = filter;
        const layers = glStyles([question]).layers.filter(l => l.id.match(/aggregated/));
        let property = '';
        switch (id) {
            case 'economic':
                property = '_economicActivity';
                break;
            case 'population':
                property = '_populationDensity';
                break;
            case 'peoplePerAgent':
                property = '_peoplePerAgent';
                break;
        }
        layers.forEach(layer => {
            const currentFilter = glLayer._glMap.getFilter(layer.id) || [];
            const newFilter = currentFilter.filter(f => {
                return !Array.isArray(f) || f[1] !== property;
            });
            const filter = [...newFilter, [">=", property, selection[0]], ["<=", property, selection[1]]];
            console.log(filter);
            glLayer._glMap.setFilter(layer.id, filter)
        });

    }

    mapSetRegion(region) {
        if (boundsLayer !== null) {
            map.removeLayer(boundsLayer)
        }
        if (region === null) return;
        boundsLayer = L.polygon(
            [[[-85.0511287798, -1E5], [85.0511287798, -1E5], [85.0511287798, 2E5], [-85.0511287798, 2E5], [-85.0511287798, -1E5]]]
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