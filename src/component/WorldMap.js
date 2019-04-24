import React, {Component} from 'react';
import L from 'leaflet';
import axios from 'axios';
import * as d3 from 'd3';
import {global} from "../constants/constant";

class WorldMap extends Component {
    constructor(props) {
        super(props)
    }

    shouldComponentUpdata() {
        return false;
    }

    componentDidMount() {
        this.props.onRef(this);
        global.map = L.map('map').setView([30.25, 120.17], 11);
        global.selectGroups = new L.layerGroup();
        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'light-v9',
            accessToken: 'pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ'
        }).addTo(global.map);
        // this.getData();
        // var coords = [[30.132932, 119.963804],[30.132932, 120.437324],
        //     [30.409347999999998, 119.963804],[30.409347999999998, 120.437324], [30.26, 120.19]];

        // for (var i = 0; i< coords.length; i++){
        //     L.circle(coords[i],200, {
        //         color: 'red',
        //         fillColor: '#f03',
        //         fillOpacity: 1.0
        //     }).addTo(global.map);
        // }

        var left = 119.963804 //new
        var right = 120.437324
        var bottom = 30.132932
        var up = 30.409347999999998

        var blockCount_col = 30;
        var blockCount_row = 24;
        var wideRange=right-left;
        var	heightRange=up-bottom;
        var wideDistance=wideRange/blockCount_col
        var heightDistance=heightRange/blockCount_row;

        Promise.all([
            d3.json("./RP.json")
        ]).then(([data])=>{
            var type = [data.P0,data.P1,data.P2,data.P3,data.P4];
            var key = ['P0','P1','P2','P3','P4'];
            for (var ii = 0; ii<type.length; ii++){
                for (var jj=0;jj<type[ii].length; jj++){
                    var grid = type[ii][jj];
                    var i = parseInt(grid.slice(0,2));
                    var j = parseInt(grid.slice(2,4));
                    var bound=[[bottom+i*heightDistance,left+j*wideDistance],[bottom+(i+1)*heightDistance,left+(j+1)*wideDistance]];
                    var colorScale=d3.scaleOrdinal()
                        .domain(['P0','P1','P2','P3','P4'])
                        .range([d3.schemeCategory10[0],d3.schemeCategory10[1],d3.schemeCategory10[2],d3.schemeCategory10[3],d3.schemeCategory10[4]]);
                    var color=colorScale(key[ii]);
                    L.rectangle(bound, {color:color, opacity:1, weight: 1}).addTo(global.map);
                }
            }
        });
    }
    componentWillUpdate(nextProps){
       if(nextProps.redraw !== this.props.redraw){
           // this.getData()
       }
    }

    insideRec(testx, testy) {
        let n = false;
        let i, j, k;
        let l = Object.keys(global.selectGroups);
        if (l.length !== 0) {
            let layerValue = Object.values(global.selectGroups._layers)
            for (i = 0; i < layerValue.length; i++) {
                var arrLatLng = layerValue[i]["_latlngs"];
                for (j = 0, k = arrLatLng[0].length - 1; j < arrLatLng[0].length; k = j++) {
                    var p1 = arrLatLng[0][j];
                    var p2 = arrLatLng[0][k];
                    if (((p1.lat <= testy && testy < p2.lat) || (
                        p2.lat <= testy && testy < p1.lat)) &&
                        (testx < ((p2.lng - p1.lng) * (testy - p1.lat) /
                            (p2.lat - p1.lat) + p1.lng))) {
                        n = !n;
                    }
                }
                if (n) {
                    return n;
                }
            }
            return n;
        }
        else {
            console.log("no rectangle")
        }
    }

    async getData() {
        d3.select(global.map.getPanes().overlayPane).select('svg').remove();
        let svg = d3.select(global.map.getPanes().overlayPane).append('svg'),
            g = svg.append('g').attr('class', 'leaflet-zoom-hide');
        svg.attr("width", 1104)
            .attr("height", 350);
        let path = svg.append("g")
            .selectAll("path");
        let res = await axios.get(global.server + '/vis1/od_test');
        let data = [];
        let count = res['data']['data'].length;
        // 构造数据
        if (global.voronoiData.length === 0) {
            for (let i = 0; i < 20; i++) {
                global.voronoiData.push(
                    [
                        global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).x,
                        global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).y,
                    ]
                )
            }
        }
        else {
            global.voronoiData = [];
            for (let i = 0; i < 20; i++) {
                if (this.insideRec(res['data']['data'][i]['fields']["offlon"], res['data']['data'][i]['fields']["offlat"])) {
                    global.voronoiData.push(
                        [
                            global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).x,
                            global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).y,
                        ]
                    )
                }
            }
        }
        data = global.voronoiData;
        // const points = [[0, 0], [0, 1], [1, 0], [1, 1]];
        // const delaunay = Delaunay.from(points);
        // const voronoi = delaunay.voronoi([0, 0, 960, 500]);
        // const data = [{x:30.24554,y:120.16193}];
        // let dataset = [5,10,15,20,25];
        let w = 1104;
        let h = 350;
        // let svg = d3.select("#map").select("svg").attr("width",w).attr("height",h);
        // let g = svg.append("g").attr("class","leaflet-zoom-hide");
        var voronoi = d3.voronoi().extent([[0, 0], [w, h]])
            .x(function (p) {
                return p[0]
            })
            .y(function (p) {
                return p[1]
            });
        //position
        var circle = g.selectAll('circle')
            .data(data)
            .enter()
            .append("circle")
            .style("stoke", "black")
            .attr("class", "position")
            .style("fill", "red")
            .attr('r', 0.1 * (global.map.getZoom() === 0 ? 1 : global.map.getZoom()))
            .attr("cx", function (p) {
                return p[0];
            })
            .attr("cy", function (p) {
                return p[1];
            });
        var voronoiP = path.data(voronoi.polygons(data)).enter().append("path");
        voronoiP.attr("stroke", "black")
            .attr("fill", "none")
            // .attr("d", function(d) { return "M" + d.join("L") + "Z" } );
            .attr("d", polygon);

        function polygon(d) {
            return "M" + d.join("L") + "Z";
        }

    }

    render() {
        return (
            <div id="map" width={this.props.width} height={this.props.height}
                 ref="map"
            ></div>
        )
    }
}

export default WorldMap;
