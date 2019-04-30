import React, {Component} from 'react';
import L from 'leaflet';
import '@elfalem/leaflet-curve'
import axios from 'axios';
import * as d3 from 'd3';
import {global} from "../constants/constant";
import 'leaflet-arc'
import {AntPath,antPath} from "react-leaflet-ant-path";
import {Map,
TileLayer} from 'react-leaflet'

const center=[30.27, 120.2];
class WorldMap extends Component {
    constructor(props) {
        super(props)
        this.map = React.createRef()
    }

    shouldComponentUpdata() {
        return false;
    }

    componentDidMount(){

        global.map = L.map('map').setView([30.27, 120.2], 11);
        global.selectGroups = new L.layerGroup();
        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'light-v9',
            accessToken: 'pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ'
        }).addTo(global.map);
        console.log(describeArc(120.1, 30.1, 100, 0, 180));
        var path = L.curve(['M',[50.54136296522163,28.520507812500004],
                'C',[52.214338608258224,28.564453125000004],
                [48.45835188280866,33.57421875000001],
                [50.680797145321655,33.83789062500001],
                'V',[48.40003249610685], 'L',[47.45839225859763,31.201171875],
                [48.40003249610685,28.564453125000004],'Z'],
            {color:'red',fill:true}).addTo(global.map);
        console.log(['M',[50.54136296522163,28.520507812500004],
                'C',[52.214338608258224,28.564453125000004],
                [48.45835188280866,33.57421875000001],
                [50.680797145321655,33.83789062500001],
                'V',[48.40003249610685], 'L',[47.45839225859763,31.201171875],
                [48.40003249610685,28.564453125000004],'Z']);
        let testP = L.point(120.1,30.1);
        let testP1 = L.point(120.2,30.2);

        function describeArc(x, y, innerRadius, outerRadius, startAngle, endAngle){
            let angle = 1/720*Math.PI;
            //that many of points

            for(let i = 0; i < ((startAngle-endAngle)*Math.PI/180/angle+1);i++ ){
                let inx = x + innerRadius * Math.cos(startAngle+ i * angle);
                let iny = y + innerRadius * Math.sin(startAngle+i * angle);

                let outx = x + outerRadius * Math.cos(startAngle+i * angle);
                let outy = y + outerRadius * Math.sin(startAngle+i * angle);

            }
            var d = [
                "M", [],
                "L", []
            ];

            return d;
        }
    }
    // componentDidMount() {
    //     // global.map = L.map('map').setView([30.27, 120.2], 11);
    //     // global.selectGroups = new L.layerGroup();
    //     // L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //     //     // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    //     //     attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
    //     //     maxZoom: 18,
    //     //     id: 'light-v9',
    //     //     accessToken: 'pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ'
    //     // }).addTo(global.map);
    //     // this.getData();
    //     // var coords = [[30.132932, 119.963804],[30.132932, 120.437324],
    //     //     [30.409347999999998, 119.963804],[30.409347999999998, 120.437324], [30.26, 120.19]];
    //     //
    //     // for (var i = 0; i< coords.length; i++){
    //     //     L.circle(coords[i],200, {
    //     //         color: 'red',
    //     //         fillColor: '#f03',
    //     //         fillOpacity: 1.0
    //     //     }).addTo(global.map);
    //     // }
    //     var left = 119.963804; //new
    //     var right = 120.437324;
    //     var bottom = 30.132932;
    //     var up = 30.409347999999998;
    //
    //     var blockCount_col = 30;
    //     var blockCount_row = 24;
    //     var wideRange = right - left;
    //     var heightRange = up - bottom;
    //     var wideDistance = wideRange / blockCount_col;
    //     var heightDistance = heightRange / blockCount_row;
    //
    //     Promise.all([
    //         d3.json("./RP.json"), axios.get(global.server + '/vis1/od_aster')
    //     ]).then(([data, asterData]) => {
    //         console.log(asterData["data"]["data"]);
    //         var type = [data.P0, data.P1, data.P2, data.P3, data.P4];
    //         var key = ['P0', 'P1', 'P2', 'P3', 'P4'];
    //
    //         // 1.create d3 relation with div and append svg
    //         let width = 1088;//rem
    //         let height = 520;
    //         let innerR = 1;
    //         let outerR = 8;
    //         let svg = d3.select(global.map.getPanes().overlayPane).append("svg")
    //             .attr("width", width)
    //             .attr("height", height);
    //         let g = svg.append("g").attr("class", "leaflet-zoom-hide");
    //
    //
    //         //draw square by LLY
    //         for (var ii = 0; ii < type.length; ii++) {
    //             for (var jj = 0; jj < type[ii].length; jj++) {
    //                 var grid = type[ii][jj];
    //                 var i = parseInt(grid.slice(0, 2));
    //                 var j = parseInt(grid.slice(2, 4));
    //                 var bound = [[bottom + i * heightDistance, left + j * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1) * wideDistance]];
    //                 var colorScale = d3.scaleOrdinal()
    //                     .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
    //                     .range([d3.schemePastel1[0], d3.schemePastel1[1], d3.schemePastel1[2], d3.schemePastel1[3], d3.schemePastel1[4]]);
    //                 var color = colorScale(key[ii]);
    //                 L.rectangle(bound, {color: color, opacity: 1, weight: 1}).addTo(global.map);
    //                 let newBound = [[bound[0][0] / 3, bound[0][1] / 3], [bound[1][0] / 3, bound[1][1] / 3]];
    //                 let r = Math.abs(newBound[0][0] - newBound[1][0]) / 2;
    //                 // console.log([left+j*wideDistance, bottom+i*heightDistance])
    //                 //     L.circle([bottom+i*heightDistance+heightDistance/2, left+j*wideDistance+wideDistance/2],200, {
    //                 //         color: color,
    //                 //         fillColor: color,
    //                 //         fillOpacity: 1.0
    //                 //     }).addTo(global.map);
    //             }
    //
    //         }
    //
    //
    //         // function projectPoint(x, y) {
    //         //     var point = global.map.latLngToLayerPoint(new L.LatLng(y, x));
    //         //     this.stream.point(point.x, point.y);
    //         // }
    //
    //         let m = 0;//max
    //         for(let i = 0; i<720;i++){
    //             //on value range
    //             let maxOn = d3.extent(asterData["data"]["data"][i], function (d,i) {
    //                 if (d[1]/*on value*/ > d[2]) return d[1];
    //                 else return d[2];
    //             })[1];
    //             //off value range
    //             let maxOff = d3.extent(asterData["data"]["data"][i], function (d,i) {
    //                 if (d[2] > d[1])return d[2];
    //                 else
    //                 return d[1];
    //             })[1];
    //             let max = Math.max(maxOn,maxOff);
    //             if(max>m) m = max;
    //         }
    //
    //         let flat = true;
    //         // draw plot by LSQ
    //         for (let i = 0; i < 2/*asterData["data"]["data"].length*/; i++) {
    //             //TODO:nume define as the nume from the source
    //             let nume = asterData["data"]["data"][i][0][0];
    //             let pos_x = nume % 30;
    //             let pos_y = Math.floor(nume / 30);
    //             let rx = left + pos_x * wideDistance + wideDistance / 2;
    //             let ry = bottom + pos_y * heightDistance + heightDistance / 2;
    //             let point = global.map.latLngToLayerPoint(new L.latLng(ry, rx));
    //             // let transform = d3.geoTransform({point: projectPoint}),
    //             //     path = d3.geoPath().projection(transform);
    //             svg.append("circle")
    //                 .attr("class","centerCircle")
    //                 .attr("r", 1)
    //                 .attr("cx", point.x)
    //                 .attr("cy", point.y)
    //                 .attr("stroke", color)
    //                 .attr("fill", color)
    //
    //             var pie = d3.pie()
    //                 .sort(null)
    //                 .value(function (d, i) {
    //                     if (flat) {
    //                         flat = false;
    //                     }
    //                     return d[1]/*onvalue*/ / m * 100
    //                 });
    //             let arc = d3.arc()
    //                 .innerRadius(innerR*global.map.getZoom()/11)
    //                 .outerRadius(function (d, i) {
    //                     if (d["data"][2]/*offvalue*/ > d["data"][1]/*onvalue*/)
    //                     //選大的
    //                         return ((outerR - innerR) * ((d["data"][2] / m)) + innerR)*global.map.getZoom()/11;
    //                     else {
    //                         return ((outerR - innerR) * ((d["data"][1] / m)) + innerR)*global.map.getZoom()/11;
    //                     }
    //                 })
    //                 .startAngle(function (d, i) {
    //                     return (i) * Math.PI / 24 * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (i + 1) * Math.PI / 24 * 2
    //                 });
    //             let arc_in = d3.arc()
    //                 .innerRadius(innerR*global.map.getZoom()/11)
    //                 .outerRadius(function (d) {
    //                     if (d["data"][2]/*offvalue*/ > d["data"][1]/*onvalue*/)
    //                     //選小的
    //                         return ((outerR - innerR) * ((d["data"][1] / m)) + innerR)*global.map.getZoom()/11;
    //                     else {
    //                         return ((outerR - innerR) * ((d["data"][2] / m)) + innerR)*global.map.getZoom()/11;
    //                     }
    //                 })
    //                 .startAngle(function (d, i) {
    //                     return (i) * Math.PI / 24 * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (i + 1) * Math.PI / 24 * 2
    //                 });
    //             let outLineArc = d3.arc()
    //                 .innerRadius(innerR*global.map.getZoom()/11)
    //                 .outerRadius((outerR + outerR / 10)*global.map.getZoom()/11)
    //                 .startAngle(function (d, i) {
    //                     return (0) * Math.PI * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (0 + 1) * Math.PI * 2
    //                 });
    //             let surround = d3.arc()
    //                 .innerRadius(innerR*global.map.getZoom()/11)
    //                 .outerRadius((outerR + outerR / 10 * 3)*global.map.getZoom()/11)
    //                 .startAngle(function (d, i) {
    //                     return (0) * Math.PI * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (0 + 1) * Math.PI * 2
    //                 });
    //             let pg = svg.append("g").attr("class", "arcPic");
    //             // .append("g");
    //             // Choose Big one
    //             pg.selectAll(".solidArc")
    //                 .data(pie(asterData["data"]["data"][i]))
    //                 .enter().append("path")
    //                 .attr("fill", function (d, i) {
    //                     if (d["data"][2]/*off value*/ > d["data"][1]/*onvalue*/)
    //                         return d3.schemePaired[0];
    //                     else
    //                         return d3.schemePaired[1];
    //                 })
    //                 .attr("class", "solidArc")
    //                 .attr("stroke", "gray")
    //                 .attr("d", arc)
    //                 .attr("transform", function (d, i) {
    //                     return "translate(" + point.x + "," + point.y + ")"
    //                 });
    //
    //
    //             pg.selectAll(".solidArc_in")
    //                 .data(pie(asterData["data"]["data"]))
    //                 .enter().append("path")
    //                 .attr("fill", function (d, i) {
    //                     if (d["data"][2]/*off value*/ > d["data"][1]/*onvalue*/)
    //                         return d3.schemePaired[1];
    //                     else
    //                         return d3.schemePaired[0];
    //                 })
    //                 .attr("class", "solidArc_in")
    //                 .attr("stroke", "gray")
    //                 .attr("d", arc_in)
    //                 .attr("transform", "translate(" + point.x + "," + point.y + ")");
    //
    //             pg.selectAll(".outlineArc")
    //                 .data([100])
    //                 .enter().append("path")
    //                 .attr("fill", "none")
    //                 .attr("class", "outlineArc")
    //                 .attr("stroke", "gray")
    //                 .attr("d", outLineArc)
    //                 .attr("transform", "translate(" + point.x + "," + point.y + ")");
    //             pg.selectAll(".surround")
    //                 .data([100])
    //                 .enter().append("path")
    //                 .attr("fill", "none")
    //                 .attr("class", "surround")
    //                 .attr("stroke", "gray")
    //                 .attr("d", surround)
    //                 .attr("transform", "translate(" + point.x + "," + point.y + ")");
    //             let fPOI_n = [];
    //             let r_POIcircle = outerR + outerR / 10 * 2;
    //             let angle_POI = 2 * Math.PI / 9;
    //             for (let itera = 0; itera < 9; itera++) {
    //                 fPOI_n.push(50);
    //             }
    //             pg.selectAll(".pPOI")
    //                 .data(fPOI_n)
    //                 .enter().append("circle")
    //                 .attr("fill", "none")
    //                 .attr("class", "pPOI")
    //                 .attr("stroke", "gray")
    //                 .attr("r", innerR)
    //                 .attr("cx", function (d, i) {
    //                     return point.x + r_POIcircle * Math.cos(i * angle_POI)
    //                 })
    //                 .attr("cy", function (d, i) {
    //                     return point.y + r_POIcircle * Math.sin(i * angle_POI)
    //                 });
    //
    //
    //
    //         }
    //         global.map.on("zoom", update);
    //         function update() {
    //             console.log("update",global.map.getZoom());
    //             //update center circle
    //             d3.selectAll(".centerCircle")
    //                 .attr("r", 1*global.map.getZoom()/11)
    //                 .attr("cx", function (d,i) {
    //                      let a = n2GIS(i);
    //                      return a.x;
    //                     }
    //                 )
    //                 .attr("cy", function (d,i) {
    //                      let a = n2GIS(i);
    //                      return a.y;
    //                     } );
    //             let arc = d3.arc()
    //                 .innerRadius(innerR*Math.pow(2,global.map.getZoom()-11))
    //                 .outerRadius(function (d, i) {
    //                     if (d["data"][2]/*offvalue*/ > d["data"][1]/*onvalue*/)
    //                     //選大的
    //                         return ((outerR - innerR)*Math.pow(2,global.map.getZoom()-11) * ((d["data"][2] / m)) + innerR*Math.pow(2,global.map.getZoom()-11));
    //                     else {
    //                         return ((outerR - innerR)*Math.pow(2,global.map.getZoom()-11) * ((d["data"][1] / m)) + innerR*Math.pow(2,global.map.getZoom()-11));
    //                     }
    //                 })
    //                 .startAngle(function (d, i) {
    //                     return (i) * Math.PI / 24 * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (i + 1) * Math.PI / 24 * 2
    //                 });
    //             d3.selectAll(".solidArc")
    //                 .attr("d", arc)
    //                 .attr("transform", function (d, i) {
    //                     console.log("t")
    //                     let point = n2GIS(i);
    //                     return "translate(" + point.x + "," + point.y + ")"
    //                 });
    //             let arc_in = d3.arc()
    //                 .innerRadius(innerR*Math.pow(2,global.map.getZoom()-11))
    //                 .outerRadius(function (d) {
    //                     if (d["data"][2]/*offvalue*/ > d["data"][1]/*onvalue*/)
    //                     //選小的
    //                         return ((outerR - innerR)*Math.pow(2,global.map.getZoom()-11) * ((d["data"][1] / m)) + innerR*Math.pow(2,global.map.getZoom()-11));
    //                     else {
    //                         return ((outerR - innerR)*Math.pow(2,global.map.getZoom()-11) * ((d["data"][2] / m)) + innerR*Math.pow(2,global.map.getZoom()-11));
    //                     }
    //                 })
    //                 .startAngle(function (d, i) {
    //                     return (i) * Math.PI / 24 * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (i + 1) * Math.PI / 24 * 2
    //                 });
    //             d3.selectAll(".solidArc_in")
    //                 .attr("d", arc_in)
    //                 .attr("transform", function (d, i) {
    //                     let point = n2GIS(i);
    //                     return "translate(" + point.x + "," + point.y + ")"
    //                 });
    //             let outLineArc = d3.arc()
    //                 .innerRadius(innerR*Math.pow(2,global.map.getZoom()-11))
    //                 .outerRadius((outerR + outerR / 10)*Math.pow(2,global.map.getZoom()-11))
    //                 .startAngle(function (d, i) {
    //                     return (0) * Math.PI * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (0 + 1) * Math.PI * 2
    //                 });
    //             d3.selectAll(".outlineArc")
    //                 .attr("d", outLineArc)
    //                 .attr("transform", function (d, i) {
    //                     let point = n2GIS(i);
    //                     return "translate(" + point.x + "," + point.y + ")"
    //                 });
    //             let surround = d3.arc()
    //                 .innerRadius(innerR*Math.pow(2,global.map.getZoom()-11))
    //                 .outerRadius((outerR + outerR / 10 * 3)*Math.pow(2,global.map.getZoom()-11))
    //                 .startAngle(function (d, i) {
    //                     return (0) * Math.PI * 2
    //                 })
    //                 .endAngle(function (d, i) {
    //                     return (0 + 1) * Math.PI * 2
    //                 });
    //             d3.selectAll(".surround")
    //                 .attr("d", surround)
    //                 .attr("transform", function (d, i) {
    //                     let point = n2GIS(i);
    //                     return "translate(" + point.x + "," + point.y + ")"
    //                 });
    //             let r_POIcircle = outerR + outerR / 10 * 2;
    //             let angle_POI = 2 * Math.PI / 9;
    //             d3.selectAll(".pPOI")
    //                 .attr("r", 1*Math.pow(2,global.map.getZoom()-11))
    //                 .attr("cx", function (d,i) {
    //                         let a = n2GIS(i);
    //                         return a.x+ r_POIcircle * Math.cos(i * angle_POI);
    //                     }
    //                 )
    //                 .attr("cy", function (d,i) {
    //                     let a = n2GIS(i);
    //                     return a.y+ r_POIcircle * Math.sin(i * angle_POI);
    //                 } );
    //             // d3.selectAll(".arcPic").remove()
    //         }
    //         function n2GIS(nume){
    //             let pos_x = nume % 30;
    //             let pos_y = Math.floor(nume / 30);
    //             let rx = left + pos_x * wideDistance + wideDistance / 2;
    //             let ry = bottom + pos_y * heightDistance + heightDistance / 2;
    //             let point = global.map.latLngToLayerPoint(new L.latLng(ry, rx));
    //             return point
    //         }
    //     });
    // }

    // componentWillUpdate(nextProps) {
    //     if (nextProps.redraw !== this.props.redraw) {
    //         // this.getData()
    //     }
    // }
    //
    // insideRec(testx, testy) {
    //     let n = false;
    //     let i, j, k;
    //     let l = Object.keys(global.selectGroups);
    //     if (l.length !== 0) {
    //         let layerValue = Object.values(global.selectGroups._layers)
    //         for (i = 0; i < layerValue.length; i++) {
    //             var arrLatLng = layerValue[i]["_latlngs"];
    //             for (j = 0, k = arrLatLng[0].length - 1; j < arrLatLng[0].length; k = j++) {
    //                 var p1 = arrLatLng[0][j];
    //                 var p2 = arrLatLng[0][k];
    //                 if (((p1.lat <= testy && testy < p2.lat) || (
    //                     p2.lat <= testy && testy < p1.lat)) &&
    //                     (testx < ((p2.lng - p1.lng) * (testy - p1.lat) /
    //                         (p2.lat - p1.lat) + p1.lng))) {
    //                     n = !n;
    //                 }
    //             }
    //             if (n) {
    //                 return n;
    //             }
    //         }
    //         return n;
    //     }
    //     else {
    //         console.log("no rectangle")
    //     }
    // }
    //
    // //draw voronoi
    // async getData() {
    //     d3.select(global.map.getPanes().overlayPane).select('svg').remove();
    //     let svg = d3.select(global.map.getPanes().overlayPane).append('svg'),
    //         g = svg.append('g').attr('class', 'leaflet-zoom-hide');
    //     svg.attr("width", 1104)
    //         .attr("height", 350);
    //     let path = svg.append("g")
    //         .selectAll("path");
    //     let res = await axios.get(global.server + '/vis1/od_test');
    //     let data = [];
    //     let count = res['data']['data'].length;
    //     // 构造数据
    //     if (global.voronoiData.length === 0) {
    //         for (let i = 0; i < 20; i++) {
    //             global.voronoiData.push(
    //                 [
    //                     global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).x,
    //                     global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).y,
    //                 ]
    //             )
    //         }
    //     }
    //     else {
    //         global.voronoiData = [];
    //         for (let i = 0; i < 20; i++) {
    //             if (this.insideRec(res['data']['data'][i]['fields']["offlon"], res['data']['data'][i]['fields']["offlat"])) {
    //                 global.voronoiData.push(
    //                     [
    //                         global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).x,
    //                         global.map.latLngToLayerPoint(L.latLng(res['data']['data'][i]['fields']["offlat"], res['data']['data'][i]['fields']["offlon"])).y,
    //                     ]
    //                 )
    //             }
    //         }
    //     }
    //     data = global.voronoiData;
    //     // const points = [[0, 0], [0, 1], [1, 0], [1, 1]];
    //     // const delaunay = Delaunay.from(points);
    //     // const voronoi = delaunay.voronoi([0, 0, 960, 500]);
    //     // const data = [{x:30.24554,y:120.16193}];
    //     // let dataset = [5,10,15,20,25];
    //     let w = 1104;
    //     let h = 350;
    //     // let svg = d3.select("#map").select("svg").attr("width",w).attr("height",h);
    //     // let g = svg.append("g").attr("class","leaflet-zoom-hide");
    //     var voronoi = d3.voronoi().extent([[0, 0], [w, h]])
    //         .x(function (p) {
    //             return p[0]
    //         })
    //         .y(function (p) {
    //             return p[1]
    //         });
    //     //position
    //     var circle = g.selectAll('circle')
    //         .data(data)
    //         .enter()
    //         .append("circle")
    //         .style("stoke", "black")
    //         .attr("class", "position")
    //         .style("fill", "red")
    //         .attr('r', 0.1 * (global.map.getZoom() === 0 ? 1 : global.map.getZoom()))
    //         .attr("cx", function (p) {
    //             return p[0];
    //         })
    //         .attr("cy", function (p) {
    //             return p[1];
    //         });
    //     var voronoiP = path.data(voronoi.polygons(data)).enter().append("path");
    //     voronoiP.attr("stroke", "black")
    //         .attr("fill", "none")
    //         // .attr("d", function(d) { return "M" + d.join("L") + "Z" } );
    //         .attr("d", polygon);
    //
    //     function polygon(d) {
    //         return "M" + d.join("L") + "Z";
    //     }
    //
    // }

    render() {
        return (
            <div id="map" ref={this.map}>
            </div>
        )
    }
}

export default WorldMap;
