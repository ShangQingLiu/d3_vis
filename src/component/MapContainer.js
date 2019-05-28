import React, {Component} from 'react';
import L from 'leaflet';
import WorldMap from "./WorldMap";
import axios from 'axios';
import {global, POIMap, POIColorArray} from "../constants/constant";
//react-bootstrap
import Card from "react-bootstrap/Card"
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
//custom component
import MapHistory from "../component/MapHistory"
import POIHeatMap from "../component/POIHeatMap"
import POIChooseDialog from "../component/POIChooseDialog"
import MultiLineChart from "../component/MultiLineChart"
import RowChart from "../component/RowChart"
// import DetaiView from "../component/DetailView"
import Glyph from '../component/Glyph'
import '../css/MapContainer.css'
import * as d3 from 'd3'
//moment
import moment from 'moment'
//react-date
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {SingleDatePicker} from 'react-dates';
//awesome icon
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faSave, faAngleDoubleLeft, faAngleDoubleRight, faArrowAltCircleLeft,
    faPlus
} from '@fortawesome/free-solid-svg-icons'
import DetailView from "./DetailView";
import HeatMapTimePicker from "../HeatMapTimePicker";

library.add(faSave);
library.add(faAngleDoubleLeft);
library.add(faAngleDoubleRight);
library.add(faArrowAltCircleLeft);
library.add(faPlus);

class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.historyLog = React.createRef();
        this.state = {
            drawCircleOn: false,
            drawPolyOn: false,
            drawRectOn: false,
            drawRectComplete: false,
            redraw: false,
            poiShow: false,
            saveCount: 0,
            saveStamp: 0,
            top3POI: '',
            lineData: '',
            date: null,
            focused: null,
            getDetailViewMessage: false,
            POIChooseClose: false,
            POIChooseIndex: '',
            POIChooseDialog2POIHeatMapMsg: '',
            HeatMapMode: false,
            HeatMapModes:'POI',
            recBound2DetailView: '',
            addHistory: false,
            setStartDestination:false,

        };
    }

    onRef = (ref) => {
        this.child = ref;
    };
    handleDrawCircle = () => {
        if (global.map.listens('mousedown')) {
            global.map.off('mousedown');
            global.map.off('mouseup');
            global.map.off('mousemove');
            global.map.dragging.enable();
        }
        else {
            let r = 0;
            let i = null;
            let tempCircle = new L.circle();

            function onmouseDown(e) {
                i = e.latlng
                //确定圆心
            }

            function onMove(e) {
                if (i) {
                    r = L.latLng(e.latlng).distanceTo(i);
                    tempCircle.setLatLng(i);
                    tempCircle.setRadius(r);
                    tempCircle.setStyle({color: '#ff0000', fillColor: '#ff0000', fill: false});
                    global.map.addLayer(tempCircle)

                }
            }

            function onmouseUp(e) {
                r = L.latLng(e.latlng).distanceTo(i)//计算半径
                L.circle(i, {radius: r, color: '#ff0000', fillColor: '#ff0000', fill: false}).addTo(global.map);
                i = null;
                r = 0
            }

            global.map.on('mousedown', onmouseDown);
            global.map.on('mouseup', onmouseUp);
            global.map.on('mousemove', onMove);
            global.map.dragging.disable();
        }
        this.setState(state => ({
            drawCircleOn: !state.drawCircleOn
        }));
    };
    handleDrawPoly = () => {
        if (global.map.listens('dblclick')) {
            global.map.off('click');    //点击地图
            global.map.off('dblclick');
            global.map.off('mousemove')//双击地图
            global.map.dragging.enable();
        }
        else {

            global.map.dragging.disable();
            let points = [];
            let lines = new L.polyline([]);
            let tempLines = new L.polyline([], {dashArray: 5});
            global.map.on('click', onClick);    //点击地图
            global.map.on('dblclick', onDoubleClick);
            global.map.on('mousemove', onMove)//双击地图


            function onClick(e) {
                points.push([e.latlng.lat, e.latlng.lng]);
                lines.addLatLng(e.latlng);
                global.map.addLayer(tempLines);
                global.map.addLayer(lines);
                global.map.addLayer(L.circle(e.latlng, {color: '#ff0000', fillColor: 'ff0000', fillOpacity: 1}))

            }

            function onMove(e) {
                if (points.length > 0) {
                    let ls = [points[points.length - 1], [e.latlng.lat, e.latlng.lng], points[0]];
                    tempLines.setLatLngs(ls)
                    // map.addLayer(tempLines)
                }
            }

            function onDoubleClick(e) {
                L.polygon(points).addTo(global.map);
                points = [];
                //map.removeLayer(tempLines)
                //tempLines.remove()
                lines.remove();
                tempLines.remove();
                lines = new L.polyline([]);
            }
        }
        this.setState(state => ({
            drawPolyOn: !state.drawPolyOn
        }));
    };
    handleDrawRec = () => {
        if (global.map.listens('mousedown')) {
            global.map.off('mousedown');    //点击地图
            global.map.off('mouseup');
            global.map.dragging.enable();
        }
        else {
            global.map.dragging.disable();
            let rectangle;
            let tmprect;
            const latlngs = [];
            global.map.on('mousedown', mouseDown);    //点击地图
            global.map.on('mouseup', mouseUp.bind(this));

            //map.off(....) 关闭该事件
            function mouseDown(e) {
                if (typeof tmprect != 'undefined') {
                    tmprect.remove()
                }
                //左上角坐标
                latlngs[0] = [e.latlng.lat, e.latlng.lng]
                //开始绘制，监听鼠标移动事件
                global.map.on('mousemove', onMove)

            }

            function onMove(e) {
                latlngs[1] = [e.latlng.lat, e.latlng.lng]
                //删除临时矩形
                if (typeof tmprect !== 'undefined') {
                    tmprect.remove()
                }
                //添加临时矩形
                tmprect = L.rectangle(latlngs, {dashArray: 5}).addTo(global.map)
            }

            function mouseUp(e) {
                //矩形绘制完成，移除临时矩形，并停止监听鼠标移动事件
                tmprect.remove();
                global.map.off('mousemove');
                //右下角坐标
                latlngs[1] = [e.latlng.lat, e.latlng.lng];
                // var bounds = L.bounds(latlngs[0],latlngs[1]);
                rectangle = L.rectangle(latlngs, {
                    color: '#3300ff',
                    fillOpacity: 0,
                    weight: 2
                });
                rectangle.on('dblclick', function () {
                    let id = L.stamp(rectangle);
                    this.setState(state => ({
                        saveCount: state.saveCount + 1,
                        saveStamp: id
                    }))
                }.bind(this));
                global.selectGroup.push(rectangle);
                global.selectGroups = L.layerGroup(global.selectGroup);
                global.map.addLayer(global.selectGroups);
                let sendBound = [rectangle._latlngs[0][1], rectangle._latlngs[0][3]];
                this.setState(state => ({
                    redraw: !state.redraw,
                    recBound2DetailView: sendBound,
                }));
                //调整view范围
                // global.map.fitBounds(latlngs);
            }
        }
        this.setState(state => ({
            drawRectOn: !state.drawRectOn

        }));
    };
    handledbClick = () => {

    };


    handleCleanSelection = () => {
        global.selectGroups.clearLayers();
        global.selectGroup = [];
    };
    handlePOIClick = () => {
        this.setState(state => ({
            poiShow: !state.poiShow
        }))
    };
    handleSave = () => {
        // this.setState(state => ({
        //     saveCount: state.saveCount + 1
        // }))
    };
    handleTrafficFlowChooseOpen = () => {
        this.setState({
            HeatMapMode:true,
            HeatMapModes:'Traffic Flow',
        })
    };
    getTop3POI = (m) => {
        this.setState({
            top3POI: m
        })
    };
    getLineData = (m) => {
        this.setState({
            lineData: m
        })
    };

    historyDraw(saveCount) {
        let mapId = 'hmap' + saveCount.toString();
        // console.log("mapid", mapId);
        global.history[saveCount]["map"] = L.map(mapId, {
            zoomControl: false,
            attributeControl: false
        }).setView([30.27, 120.2], 8);
        L.tileLayer('https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ', {
            // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        }).addTo(global.history[saveCount]["map"]);
    }

    drawGrid(map, curveGroup, curveGroups, innerCircleGroup, innerCircleGroups, POIGroup, POIGroups, fValue) {
        function describeArc(lng, lat, innerRadius, outerRadius, startAngle, endAngle, value) {
            let innerTest = 0.0017884;
            let outerTest = 0.00400;
            if (value > 0) {
                if (Math.log(value) / 4000 > 0)
                    outerTest = Math.log(value) / 4000 + innerTest;
                else {
                    outerTest = 0 + innerTest;
                }
            }
            else {
                outerTest = 0 + innerTest;
            }
            if (outerTest + 0.0005 < 0.004) {
                outerTest = outerTest + 0.0005;
            }
            let angle = 1 / 360 * Math.PI;
            //that many of points
            let inA = [];
            let outA = [];
            //((endAngle-startAngle)*Math.PI/180/angle+1) is number of the points that would produce in 1/720*PI scale
            for (let i = 0; i < 30/*((endAngle-startAngle)*Math.PI/180/angle+1)*/; i++) {
                // let p = L.latLng(lat,lng);
                // let ep = global.map.latLngToLayerPoint(p);

                let inx = lng + innerTest * Math.cos(startAngle / 180 * Math.PI + i * angle) * 1.17;
                let iny = lat + innerTest * Math.sin(startAngle / 180 * Math.PI + i * angle);
                // let rp = L.point(inx,iny);
                // let ap = global.map.layerPointToLatLng(rp);
                inA.push([iny, inx]);

                let outx = lng + outerTest * Math.cos(startAngle / 180 * Math.PI + i * angle) * 1.17;
                let outy = lat + outerTest * Math.sin(startAngle / 180 * Math.PI + i * angle);
                // rp = L.point(outx,outy);
                // ap = global.map.layerPointToLatLng(rp);
                outA.push([outy, outx]);
            }
            let d = [];
            d.push("M");
            d.push(inA[0]);
            inA.shift();
            d.push("L");
            d = d.concat(inA);
            d.push("M");
            d.push(inA[0]);
            d.push("L");
            d.push(outA[0]);
            outA.shift();
            d = d.concat(outA);
            d.push(inA[inA.length - 1]);
            return d;
        }

        let left = 119.963804; //new
        let right = 120.437324;
        let bottom = 30.132932;
        let up = 30.409347999999998;

        let blockCount_col = 30;
        let blockCount_row = 24;
        let wideRange = right - left;
        let heightRange = up - bottom;
        let wideDistance = wideRange / blockCount_col;
        let heightDistance = heightRange / blockCount_row;

        let ty = "all".toString();
        let params = {
            ty: ty
        };
        if (fValue === 0) {
            Promise.all([
                d3.json("./RP.json"), axios.get(global.server + '/vis1/od_aster'),
                axios.get(global.server + '/vis1/poi_total', {params})
            ]).then(([data, asterData, poiData]) => {
                console.log(asterData);
                let type = [data.P0, data.P1, data.P2, data.P3, data.P4];
                let key = ['P0', 'P1', 'P2', 'P3', 'P4'];

                //TODO:remove flag
                // let flag=true;
                //draw square by LLY
                if (Object.keys(innerCircleGroups).length !== 0) {
                    innerCircleGroups.clearLayers();
                    innerCircleGroup = [];
                }
                for (let ii = 0; ii < type.length; ii++) {
                    for (let jj = 0; jj < type[ii].length; jj++) {
                        let grid = type[ii][jj];
                        let i = parseInt(grid.slice(0, 2));
                        let j = parseInt(grid.slice(2, 4));
                        // let bound = [[bottom + i * heightDistance, left + j * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1) * wideDistance]];
                        // let colorScale = d3.scaleOrdinal()
                        //     .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                        //     .range([d3.schemePastel1[0], d3.schemePastel1[1], d3.schemePastel1[2], d3.schemePastel1[3], d3.schemePastel1[5]]);
                        // let color = colorScale(key[ii]);
                        let incolorScale = d3.scaleOrdinal()
                            .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                            .range([d3.schemeCategory10[0], d3.schemeCategory10[1], d3.schemeCategory10[2], d3.schemeCategory10[3], d3.schemeCategory10[4]]);
                        let incolor = incolorScale(key[ii]);
                        let o1color = ['#62A7D1', '#AF89C7', '#F2A444', '#818C94', '#DB6F53', '#67C294'];
                        let o2color = ['#F2A444', '#818C94', '#DB6F53', '#67C294', '#62A7D1', '#AF89C7'];
                        let o3color = ['AF89C7', '#F2A444', '#818C94', '#DB6F53', '#67C294', '#62A7D1'];
                        let o4color = ['#818C94', '#DB6F53', '#67C294', '#62A7D1', '#AF89C7', '#333333'];
                        let o5color = ['#DB6F53', '#67C294', '#62A7D1', '#AF89C7', '#F2A444', '#818C94'];
                        let customColorScale = d3.scaleOrdinal()
                            .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                            .range([o1color, o2color, o3color, o4color, o5color]);
                        let ocolor = customColorScale(key[ii]);
                        //divide grid
                        // L.rectangle(bound, {color: "white", fill:true,opacity: 1, weight: 1,stroke:true,fillColor:"white",fillOpacity:1}).addTo(global.map);
                        // let newBound = [[bound[0][0] / 3, bound[0][1] / 3], [bound[1][0] / 3, bound[1][1] / 3]];
                        let ir = 200;
                        let cy = left + j * wideDistance + wideDistance / 2;
                        let cx = bottom + i * heightDistance + heightDistance / 2;
                        let oR = 450;
                        let outR = 640;
                        //inner circle
                        let flowSum = function () {
                            let sum = 0;
                            for (let g = 0; g < 24; g++) {
                                sum += parseInt(asterData["data"]["data"][30 * i + j][g][3])
                            }
                            return sum;
                        };
                        let mapLevel = map.getZoom();
                        if (mapLevel >= 12) {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let c1 = L.circle([cx, cy], {
                                radius: ir, color: incolor, opacity: 0.78, fill: true, fillOpacity:
                                Math.log(Math.pow(1.00005, flowSum())) / 1.5
                                , stroke: false
                            });
                            let c2 = L.circle([cx, cy], {
                                radius: oR,
                                color: "#101010",
                                opacity: 0.1,
                                fill: false
                            });
                            let c3 = L.circle([cx, cy], {
                                radius: outR,
                                color: "#101010",
                                opacity: 0.1,
                                fill: false
                            });
                            innerCircleGroup.push(c1, c2, c3)
                            innerCircleGroups = L.layerGroup(innerCircleGroup)
                            map.addLayer(innerCircleGroups);
                            // }
                        }
                        else {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let c1 = L.circle([cx, cy], {
                                radius: outR, color: incolor, opacity: 0.78, fill: true, fillOpacity:
                                Math.log(Math.pow(1.00005, flowSum())) / 1.5
                                , stroke: false
                            });
                            innerCircleGroup.push(c1)
                            innerCircleGroups = L.layerGroup(innerCircleGroup)
                            map.addLayer(innerCircleGroups);
                            // }
                        }
                        if (mapLevel > 12) {
                            //do 24hr arc
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let numGrid = 30 * i + j;
                            let angs = 0;
                            let ange = 15;
                            let anStep = 15;
                            for (let myI = 0; myI < 24; myI++) {
                                let inCurve, outCurve;
                                // let colorA = "#D38ABD";
                                // let colorB = "#8CD1E0";
                                if (asterData["data"]["data"][numGrid][myI][1] > asterData["data"]["data"][numGrid][myI][2]) {
                                    inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: 'g5732a8',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#4284f5',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    curveGroup.push(inCurve);
                                    curveGroup.push(outCurve);
                                }
                                else {
                                    outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#4284f5',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#5732a8',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    //     outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][2]),
                                    //         {color: ocolor[5], fill: true,stroke:true,fillColor:'#4284f5',fillOpacity:1,weight:1});
                                    //     inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][1]),
                                    //         {color: ocolor[5], fill: true,stroke:true,fillColor:'#5732a8',fillOpacity:1,weight:1});
                                    //
                                    curveGroup.push(outCurve);
                                    curveGroup.push(inCurve);
                                }
                            }
                            curveGroups = L.layerGroup(curveGroup);
                            map.addLayer(curveGroups);
                            // }
                        }
                        else {
                            if (Object.keys(curveGroups).length !== 0) {
                                curveGroups.clearLayers();
                                curveGroup = [];
                            }
                        }
                        //draw poi circle 9
                        if (mapLevel > 12) {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            for (let myI = 0; myI < 9; myI++) {
                                let poir = 0.0057;
                                let poiR = 20;
                                if (poiData["data"]["data"][30 * i + j][POIMap[myI]]) {
                                    // poiR = (poiData["data"]["data"][30*i+j][POIMap[myI]]/200>100)?100:poiData["data"]["data"][30*i+j][POIMap[myI]]/150;
                                    poiR = poiData["data"]["data"][30 * i + j][POIMap[myI]] / 200 * 40 + 30;
                                    if (poiR > 80) {
                                        poiR = 80;
                                    }

                                }
                                if (poiR > 30) {
                                    let poix = cx + poir * Math.sin(2 * Math.PI / 9 * myI) * 0.87;
                                    let poiy = cy + poir * Math.cos(2 * Math.PI / 9 * myI);
                                    let poiCircle = L.circle([poix, poiy], {
                                        radius: poiR,
                                        color: POIColorArray[myI],
                                        fillOpacity: 1,
                                        opacity: 1,
                                        fill: true,
                                        fillColor: POIColorArray[myI]
                                    });
                                    // L.imageOverlay(global.poimap[myI],[[poix-poiR,poiy-poiR],[poix+poiR,poiy+poiR]]);
                                    POIGroup.push(poiCircle);
                                }
                            }
                            POIGroups = L.layerGroup(POIGroup);
                            map.addLayer(POIGroups);
                            // }
                        }
                        else {
                            if (Object.keys(POIGroups).length !== 0) {
                                POIGroups.clearLayers();
                                POIGroup = [];
                            }
                        }
                    }

                }
            });
        }
        else if (fValue === 1) {

            Promise.all([
                d3.json("./splitResult/RP.json"), axios.get(global.server + '/vis1/od_aster'),
                axios.get(global.server + '/vis1/poi_total', {params})
            ]).then(([data, asterData, poiData]) => {
                console.log(asterData);
                let type = [data.P0, data.P1, data.P2, data.P3, data.P4, data.P5];
                let key = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'];

                //TODO:remove flag
                // let flag=true;
                //draw square by LLY
                if (Object.keys(innerCircleGroups).length !== 0) {
                    innerCircleGroups.clearLayers();
                    innerCircleGroup = [];
                }
                for (let ii = 0; ii < type.length; ii++) {
                    for (let jj = 0; jj < type[ii].length; jj++) {
                        let grid = type[ii][jj];
                        let i = parseInt(grid.slice(0, 2));
                        let j = parseInt(grid.slice(2, 4));
                        // let bound = [[bottom + i * heightDistance, left + j * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1) * wideDistance]];
                        // let colorScale = d3.scaleOrdinal()
                        //     .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                        //     .range([d3.schemePastel1[0], d3.schemePastel1[1], d3.schemePastel1[2], d3.schemePastel1[3], d3.schemePastel1[5]]);
                        // let color = colorScale(key[ii]);
                        let incolorScale = d3.scaleOrdinal()
                            .domain(['P0', 'P1', 'P2', 'P3', 'P4', 'P5'])
                            .range([d3.schemeCategory10[0], d3.schemeCategory10[1], d3.schemeCategory10[2], d3.schemeCategory10[3], d3.schemeCategory10[4], d3.schemeCategory10[5]]);
                        let incolor = incolorScale(key[ii]);
                        let o1color = ['#62A7D1', '#AF89C7', '#F2A444', '#818C94', '#DB6F53', '#67C294'];
                        let o2color = ['#F2A444', '#818C94', '#DB6F53', '#67C294', '#62A7D1', '#AF89C7'];
                        let o3color = ['AF89C7', '#F2A444', '#818C94', '#DB6F53', '#67C294', '#62A7D1'];
                        let o4color = ['#818C94', '#DB6F53', '#67C294', '#62A7D1', '#AF89C7', '#333333'];
                        let o5color = ['#DB6F53', '#67C294', '#62A7D1', '#AF89C7', '#F2A444', '#818C94'];
                        let o6color = ['#DB6F53', '#67C294', '#62A7D1', '#AF89C7', '#F2A444', '#818C94'];
                        let customColorScale = d3.scaleOrdinal()
                            .domain(['P0', 'P1', 'P2', 'P3', 'P4', 'P5'])
                            .range([o1color, o2color, o3color, o4color, o5color, o6color]);
                        let ocolor = customColorScale(key[ii]);
                        //divide grid
                        // L.rectangle(bound, {color: "white", fill:true,opacity: 1, weight: 1,stroke:true,fillColor:"white",fillOpacity:1}).addTo(global.map);
                        // let newBound = [[bound[0][0] / 3, bound[0][1] / 3], [bound[1][0] / 3, bound[1][1] / 3]];
                        let ir = 200;
                        let cy = left + j * wideDistance + wideDistance / 2;
                        let cx = bottom + i * heightDistance + heightDistance / 2;
                        let oR = 450;
                        let outR = 640;
                        //inner circle
                        let flowSum = function () {
                            let sum = 0;
                            for (let g = 0; g < 24; g++) {
                                sum += parseInt(asterData["data"]["data"][30 * i + j][g][3])
                            }
                            return sum;
                        };
                        let mapLevel = map.getZoom();
                        if (mapLevel >= 12) {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let c1 = L.circle([cx, cy], {
                                radius: ir, color: incolor, opacity: 0.78, fill: true, fillOpacity:
                                Math.log(Math.pow(1.00005, flowSum())) / 1.5
                                , stroke: false
                            });
                            let c2 = L.circle([cx, cy], {
                                radius: oR,
                                color: "#101010",
                                opacity: 0.1,
                                fill: false
                            });
                            let c3 = L.circle([cx, cy], {
                                radius: outR,
                                color: "#101010",
                                opacity: 0.1,
                                fill: false
                            });
                            innerCircleGroup.push(c1, c2, c3)
                            innerCircleGroups = L.layerGroup(innerCircleGroup)
                            map.addLayer(innerCircleGroups);
                            // }
                        }
                        else {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let c1 = L.circle([cx, cy], {
                                radius: outR, color: incolor, opacity: 0.78, fill: true, fillOpacity:
                                Math.log(Math.pow(1.00005, flowSum())) / 1.5
                                , stroke: false
                            });
                            innerCircleGroup.push(c1)
                            innerCircleGroups = L.layerGroup(innerCircleGroup)
                            map.addLayer(innerCircleGroups);
                            // }
                        }
                        if (mapLevel > 12) {
                            //do 24hr arc
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let numGrid = 30 * i + j;
                            let angs = 0;
                            let ange = 15;
                            let anStep = 15;
                            for (let myI = 0; myI < 24; myI++) {
                                let inCurve, outCurve;
                                // let colorA = "#D38ABD";
                                // let colorB = "#8CD1E0";
                                if (asterData["data"]["data"][numGrid][myI][1] > asterData["data"]["data"][numGrid][myI][2]) {
                                    inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: 'g5732a8',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#4284f5',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    curveGroup.push(inCurve);
                                    curveGroup.push(outCurve);
                                }
                                else {
                                    outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#4284f5',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#5732a8',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    //     outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][2]),
                                    //         {color: ocolor[5], fill: true,stroke:true,fillColor:'#4284f5',fillOpacity:1,weight:1});
                                    //     inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][1]),
                                    //         {color: ocolor[5], fill: true,stroke:true,fillColor:'#5732a8',fillOpacity:1,weight:1});
                                    //
                                    curveGroup.push(outCurve);
                                    curveGroup.push(inCurve);
                                }
                            }
                            curveGroups = L.layerGroup(curveGroup);
                            map.addLayer(curveGroups);
                            // }
                        }
                        else {
                            if (Object.keys(curveGroups).length !== 0) {
                                curveGroups.clearLayers();
                                curveGroup = [];
                            }
                        }
                        //draw poi circle 9
                        if (mapLevel > 12) {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            for (let myI = 0; myI < 9; myI++) {
                                let poir = 0.0057;
                                let poiR = 20;
                                if (poiData["data"]["data"][30 * i + j][POIMap[myI]]) {
                                    // poiR = (poiData["data"]["data"][30*i+j][POIMap[myI]]/200>100)?100:poiData["data"]["data"][30*i+j][POIMap[myI]]/150;
                                    poiR = poiData["data"]["data"][30 * i + j][POIMap[myI]] / 200 * 40 + 30;
                                    if (poiR > 80) {
                                        poiR = 80;
                                    }

                                }
                                if (poiR > 30) {
                                    let poix = cx + poir * Math.sin(2 * Math.PI / 9 * myI) * 0.87;
                                    let poiy = cy + poir * Math.cos(2 * Math.PI / 9 * myI);
                                    let poiCircle = L.circle([poix, poiy], {
                                        radius: poiR,
                                        color: POIColorArray[myI],
                                        fillOpacity: 1,
                                        opacity: 1,
                                        fill: true,
                                        fillColor: POIColorArray[myI]
                                    });
                                    // L.imageOverlay(global.poimap[myI],[[poix-poiR,poiy-poiR],[poix+poiR,poiy+poiR]]);
                                    POIGroup.push(poiCircle);
                                }
                            }
                            POIGroups = L.layerGroup(POIGroup);
                            map.addLayer(POIGroups);
                            // }
                        }
                        else {
                            if (Object.keys(POIGroups).length !== 0) {
                                POIGroups.clearLayers();
                                POIGroup = [];
                            }
                        }
                    }

                }
            });
        }
        else if (fValue === 2) {

            Promise.all([
                d3.json("./mergeResult/RP.json"), axios.get(global.server + '/vis1/od_aster'),
                axios.get(global.server + '/vis1/poi_total', {params})
            ]).then(([data, asterData, poiData]) => {
                console.log(asterData);
                let type = [data.P0, data.P1, data.P2, data.P3, data.P5];
                let key = ['P0', 'P1', 'P2', 'P3', 'P5'];

                //TODO:remove flag
                // let flag=true;
                //draw square by LLY
                if (Object.keys(innerCircleGroups).length !== 0) {
                    innerCircleGroups.clearLayers();
                    innerCircleGroup = [];
                }
                for (let ii = 0; ii < type.length; ii++) {
                    for (let jj = 0; jj < type[ii].length; jj++) {
                        let grid = type[ii][jj];
                        let i = parseInt(grid.slice(0, 2));
                        let j = parseInt(grid.slice(2, 4));
                        // let bound = [[bottom + i * heightDistance, left + j * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1) * wideDistance]];
                        // let colorScale = d3.scaleOrdinal()
                        //     .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                        //     .range([d3.schemePastel1[0], d3.schemePastel1[1], d3.schemePastel1[2], d3.schemePastel1[3], d3.schemePastel1[5]]);
                        // let color = colorScale(key[ii]);
                        let incolorScale = d3.scaleOrdinal()
                            .domain(['P0', 'P1', 'P2', 'P3', 'P5'])
                            .range([d3.schemeCategory10[0], d3.schemeCategory10[1], d3.schemeCategory10[2], d3.schemeCategory10[3], d3.schemeCategory10[5]]);
                        let incolor = incolorScale(key[ii]);
                        let o1color = ['#62A7D1', '#AF89C7', '#F2A444', '#818C94', '#DB6F53', '#67C294'];
                        let o2color = ['#F2A444', '#818C94', '#DB6F53', '#67C294', '#62A7D1', '#AF89C7'];
                        let o3color = ['AF89C7', '#F2A444', '#818C94', '#DB6F53', '#67C294', '#62A7D1'];
                        let o4color = ['#818C94', '#DB6F53', '#67C294', '#62A7D1', '#AF89C7', '#333333'];
                        let o5color = ['#DB6F53', '#67C294', '#62A7D1', '#AF89C7', '#F2A444', '#818C94'];
                        let customColorScale = d3.scaleOrdinal()
                            .domain(['P0', 'P1', 'P2', 'P3', 'P5'])
                            .range([o1color, o2color, o3color, o4color, o5color]);
                        let ocolor = customColorScale(key[ii]);
                        //divide grid
                        // L.rectangle(bound, {color: "white", fill:true,opacity: 1, weight: 1,stroke:true,fillColor:"white",fillOpacity:1}).addTo(global.map);
                        // let newBound = [[bound[0][0] / 3, bound[0][1] / 3], [bound[1][0] / 3, bound[1][1] / 3]];
                        let ir = 200;
                        let cy = left + j * wideDistance + wideDistance / 2;
                        let cx = bottom + i * heightDistance + heightDistance / 2;
                        let oR = 450;
                        let outR = 640;
                        //inner circle
                        let flowSum = function () {
                            let sum = 0;
                            for (let g = 0; g < 24; g++) {
                                sum += parseInt(asterData["data"]["data"][30 * i + j][g][3])
                            }
                            return sum;
                        };
                        let mapLevel = map.getZoom();
                        if (mapLevel >= 12) {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let c1 = L.circle([cx, cy], {
                                radius: ir, color: incolor, opacity: 0.78, fill: true, fillOpacity:
                                Math.log(Math.pow(1.00005, flowSum())) / 1.5
                                , stroke: false
                            });
                            let c2 = L.circle([cx, cy], {
                                radius: oR,
                                color: "#101010",
                                opacity: 0.1,
                                fill: false
                            });
                            let c3 = L.circle([cx, cy], {
                                radius: outR,
                                color: "#101010",
                                opacity: 0.1,
                                fill: false
                            });
                            innerCircleGroup.push(c1, c2, c3)
                            innerCircleGroups = L.layerGroup(innerCircleGroup)
                            map.addLayer(innerCircleGroups);
                            // }
                        }
                        else {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let c1 = L.circle([cx, cy], {
                                radius: outR, color: incolor, opacity: 0.78, fill: true, fillOpacity:
                                Math.log(Math.pow(1.00005, flowSum())) / 1.5
                                , stroke: false
                            });
                            innerCircleGroup.push(c1)
                            innerCircleGroups = L.layerGroup(innerCircleGroup)
                            map.addLayer(innerCircleGroups);
                            // }
                        }
                        if (mapLevel > 12) {
                            //do 24hr arc
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            let numGrid = 30 * i + j;
                            let angs = 0;
                            let ange = 15;
                            let anStep = 15;
                            for (let myI = 0; myI < 24; myI++) {
                                let inCurve, outCurve;
                                // let colorA = "#D38ABD";
                                // let colorB = "#8CD1E0";
                                if (asterData["data"]["data"][numGrid][myI][1] > asterData["data"]["data"][numGrid][myI][2]) {
                                    inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: 'g5732a8',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#4284f5',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    curveGroup.push(inCurve);
                                    curveGroup.push(outCurve);
                                }
                                else {
                                    outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#4284f5',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
                                        {
                                            color: ocolor[5],
                                            fill: true,
                                            stroke: true,
                                            fillColor: '#5732a8',
                                            fillOpacity: 1,
                                            weight: 1
                                        });
                                    //     outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][2]),
                                    //         {color: ocolor[5], fill: true,stroke:true,fillColor:'#4284f5',fillOpacity:1,weight:1});
                                    //     inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][1]),
                                    //         {color: ocolor[5], fill: true,stroke:true,fillColor:'#5732a8',fillOpacity:1,weight:1});
                                    //
                                    curveGroup.push(outCurve);
                                    curveGroup.push(inCurve);
                                }
                            }
                            curveGroups = L.layerGroup(curveGroup);
                            map.addLayer(curveGroups);
                            // }
                        }
                        else {
                            if (Object.keys(curveGroups).length !== 0) {
                                curveGroups.clearLayers();
                                curveGroup = [];
                            }
                        }
                        //draw poi circle 9
                        if (mapLevel > 12) {
                            // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                            for (let myI = 0; myI < 9; myI++) {
                                let poir = 0.0057;
                                let poiR = 20;
                                if (poiData["data"]["data"][30 * i + j][POIMap[myI]]) {
                                    // poiR = (poiData["data"]["data"][30*i+j][POIMap[myI]]/200>100)?100:poiData["data"]["data"][30*i+j][POIMap[myI]]/150;
                                    poiR = poiData["data"]["data"][30 * i + j][POIMap[myI]] / 200 * 40 + 30;
                                    if (poiR > 80) {
                                        poiR = 80;
                                    }

                                }
                                if (poiR > 30) {
                                    let poix = cx + poir * Math.sin(2 * Math.PI / 9 * myI) * 0.87;
                                    let poiy = cy + poir * Math.cos(2 * Math.PI / 9 * myI);
                                    let poiCircle = L.circle([poix, poiy], {
                                        radius: poiR,
                                        color: POIColorArray[myI],
                                        fillOpacity: 1,
                                        opacity: 1,
                                        fill: true,
                                        fillColor: POIColorArray[myI]
                                    });
                                    // L.imageOverlay(global.poimap[myI],[[poix-poiR,poiy-poiR],[poix+poiR,poiy+poiR]]);
                                    POIGroup.push(poiCircle);
                                }
                            }
                            POIGroups = L.layerGroup(POIGroup);
                            map.addLayer(POIGroups);
                            // }
                        }
                        else {
                            if (Object.keys(POIGroups).length !== 0) {
                                POIGroups.clearLayers();
                                POIGroup = [];
                            }
                        }
                    }

                }
            });
        }
    }

    worldMap2DetailView = () => {
        this.setState((state) => (
            {
                getDetailViewMessage: !state.getDetailViewMessage
            }))
    };
    //Choose POI List insite heatmap of POI list
    handlePOIChooseOpen = () => {
        this.setState({
            POIChooseClose: true,
        })
    };
    handlePOIChooseClose = (chooseIndex) => {
        this.setState({
            POIChooseClose: false,
            POIChooseIndex: chooseIndex,
        })
    };
    POIChooseDialog2POIHeatMap = (msg) => {
        console.log('msg', msg);
        this.setState({
            POIChooseDialog2POIHeatMapMsg: msg,
            HeatMapMode: true,
            HeatMapModes:'POI',
        })
    };
    closeHeatMapMode = () => {
        this.setState({
            HeatMapMode: false,
        })
    };
    addHistory = () => {
        this.setState((state) => (
            {
                addHistory: !state.addHistory
            }))
    };
    testGetRoute = ()=>{
        Promise.all(
            [axios.get(global.server + '/vis1/getRoute')]
        ).then(([data])=>{
            console.log("test",data);
        })
    };

    setStartDestination=()=>{
     this.setState({setStartDestination:true})
    };
    //Life cycle
    ///////////
    //Deprecate
    //@ using number to save the history in global
    ///////////
    // componentDidUpdate = (prevProps, prevState) => {
    //     let saveNum = this.state.saveCount - prevState.saveCount;
    //     if (saveNum !== 0) {
    //         for (let i = 0; i < saveNum; i++) {
    //             global.history.push({})
    //         }
    //         for (let i = prevState.saveCount; i < this.state.saveCount; i++) {
    //             //TODO:put content inside of history
    //             //top 3 of poi
    //             //GET
    //             //lineData
    //             //GET
    //             //construct history
    //             global.history.push({});
    //             global.history[i]["top3POI"] = this.state.top3POI;
    //             global.history[i]["lineData"] = this.state.lineData;
    //             let card = d3.select("#historyLog")
    //                 .data(global.history)
    //                 .append("div")
    //                 .attr("style", "float:left;width:157px;height:167px;border:1px;borderColor:LightGrey");
    //             let hmap = card.append("div")
    //                 .attr("id", function (d, i) {
    //                     return "hmap" + i.toString()
    //                 })
    //                 .attr("style", "height:150px;width:157px;")
    //             for (let j = 0; j < 3; j++) {
    //                 let badge = card.append("div")
    //                     .append('embed'this.props.mode)
    //                     .attr('src', function () {
    //                         return global.poimap[POIMap.indexOf(global.history[j]["top3POI"])]
    //                     })
    //                     .attr("style", "height:15px;width:15px;")
    //                     .attr('src', function () {
    //                         return global.poimap[POIMap.indexOf(global.history[j]["top3POI"])]
    //                     })
    //             }
    //             let colorLine = card.append("div")
    //                 .attr("class", "gradient-line")
    //                 .attr("width", 100)
    //                 .attr("height", 15)
    //                 .attr("border", 1)
    //                 .attr("borderColor", "LightGrey")
    //                 .attr("float", "right")
    //                 .attr('marginTop', 3);
    //             this.historyDraw(i)
    //         }
    //     }
    // };

    componentDidMount() {
        this.historyDraw(0)
        this.drawGrid(global.history[0]["map"], global.curveGroup0, global.curveGroups0, global.innerCircleGroup0, global.innerCircleGroups0, global.POIGroup0, global.POIGroups0, 0);
        this.historyDraw(1)
        this.drawGrid(global.history[1]["map"], global.curveGroup1, global.curveGroups1, global.innerCircleGroup1, global.innerCircleGroups1, global.POIGroup1, global.POIGroups1, 1);
        this.historyDraw(2)
        this.drawGrid(global.history[2]["map"], global.curveGroup2, global.curveGroups2, global.innerCircleGroup2, global.innerCircleGroups2, global.POIGroup2, global.POIGroups2, 2)
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.addHistory !== this.state.addHistory) {
            //find Rectangle
            let saveData = {};
            console.log(global.selectGroups);

            if (Object.keys(global.selectGroups._layers).length === 0) {
                saveData["rectangle"] = {};
            }
            else {

            }
        }
    }

    render() {
        // const {date, format, mode, inputFormat} = this.state;
        //TODO:finish POIhistory
        // let poiHistory = Object.keys(global.history).length === 0 ? global.history.map((item, index) => (
        //     //calculate the new history
        //     <Card style={{float: "left", width: '9.8rem', height: '167px'}}>
        //         <div id={"hmap" + index.toString()} style={{height: 150, width: 156}}></div>
        //         <div style={{float: "left"}}>
        //             {item["top3POI"].map(function (name) {
        //                 return <embed src={name} style={{width: 15, height: 15}}></embed>
        //             })
        //             }
        //             //TODO:change color with line number
        //             <div className="gradient-line" style={{
        //                 width: 100, height: 15, border: "1px solid", borderColor: "LightGrey", float: "right"
        //                 , marginTop: 3,
        //             }}></div>
        //         </div>
        //     </Card>
        // )) : <div></div>;


        // function historyDraw(saveCount) {
        //     global.history[saveCount]["map"] = L.map('hmap' + saveCount.toString()).setView([30.27, 120.2], 8);
        //     L.tileLayer('https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ', {
        //         // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        //     }).addTo(global.history[saveCount]["map"]);
        // }

        const poimap = ['art-en.svg', 'collage-university.svg', 'food.svg', 'nightlife.svg', 'outdoor.svg', 'professional.svg', 'residence.svg', 'shop.svg', 'travel.svg'];
        const POIMap = ["Art_Entertainment",
            "College_University",
            "Food", "Professional_OtherPlaces", "NightlifeSpots", "Residence", "Sports_Recreation", "shop_Service", "Travel_Transport"];
        const listPoi = poimap.map((item, index) =>
            <div style={{textIndent: "1em"}}>
                <label>
                    <input id="checkNMF" type="checkbox" name="group0" className="filled-in"
                           onClick={this.handleDrawRec}/>
                    <embed src={item} display="block" width="15px" height="15px"
                           key={item.toString()}></embed>
                    <span style={{fontSize: "5px"}}>{POIMap[index]}</span>
                </label>
            </div>
        );
        return (
            <div>
                <div style={{float: "left"}}>
                    <Card style={{width: '15.5rem', height: '44.8rem'}}>
                        <Card.Header as="h6" style={{height: "44px"}}>Data Overview</Card.Header>
                        <div className="sigma-content">
                            <div className="sigma-middle-line">
                                <span className="sigma-line-text">Data Set</span>
                            </div>
                        </div>
                        <div align="middle">
                            <select style={{width: "245px", align: "center"}} className="browser-default selectClass">
                                <option value="1"> Using HangZhou POIS</option>
                            </select>
                        </div>
                        <div style={{marginTop: "10px"}}>
                            <select className="browser-default selectClass">
                                <option value="1">Using HangZhou Taxi Trajectory</option>
                            </select>
                        </div>
                        <div className="sigma-content">
                            <div className="sigma-middle-line">
                                <span className="sigma-line-text">Date</span>
                            </div>
                        </div>
                        <SingleDatePicker
                            // showClearDate={true}
                            // customInputIcon={
                            //     <svg className="icon icon-small">
                            //         {/*<Icon*/}
                            //             {/*icon="ICON_CALENDER"*/}
                            //             {/*className="icon icon-large"*/}
                            //         {/*/>*/}
                            //     </svg>
                            // }
                            inputIconPosition="after"
                            small={true}
                            block={true}
                            numberOfMonths={1}
                            date={this.state.date}
                            onDateChange={date => this.setState({date})}
                            focused={this.state.focused}
                            onFocusChange={({focused}) =>
                                this.setState({focused})
                            }
                            openDirection="down"
                            hideKeyboardShortcutsPanel={true}
                            daySize={28}
                            isOutsideRange={(day) =>
                                !(day.isBefore(moment("2015-05-01")) && day.isAfter(moment("2015-04-01")))
                            }
                            initialVisibleMonth={() => moment("2015-04")}
                            placeholder={"Select Date                                 ▼"}
                        />
                        <div className="sigma-content">
                            <div className="sigma-middle-line">
                                <span className="sigma-line-text">AOI Area</span>
                            </div>
                        </div>
                        <form id="Mycheckbox">
                            <div className="col s12">
                                <p>
                                    <label>
                                        <input id="checkTrafficFlow" type="checkbox" name="group0" className="filled-in"
                                               onClick={this.handlePOIClick}/>
                                        <span>select a single POI</span>
                                    </label>
                                </p>
                                {this.state.poiShow && listPoi}
                            </div>
                            <div className="col s12">
                                <p>
                                    <label>
                                        <input id="checkNMF" type="checkbox" name="group0" className="filled-in"
                                               onClick={this.handleDrawRec}/>
                                        <span>specify a rectangle area</span>
                                    </label>
                                </p>
                            </div>
                            <div className="col s12">
                                <p>
                                    <label>
                                        <input id="checkInterView" type="checkbox" name="group0" className="filled-in"
                                        />
                                        <span>select an administrative zone</span>
                                    </label>
                                </p>
                            </div>
                        </form>
                        {/*<Button varient="primary" size="sm" onClick={this.handleDrawCircle}>draw circle</Button>*/}
                        {/*<Button varient="primary" size="sm" onClick={this.handleDrawPoly}>draw polygon</Button>*/}
                        {/*<Button varient="primary" size="sm" onClick={this.handleDrawRec}>draw rectangle</Button>*/}
                        {/*<Button varient="primary" size="sm" onClick={this.handleCleanSelection}>clean selection</Button>*/}
                        <Glyph/>
                    </Card>
                </div>
                <div>
                    <Card style={{float: "left", width: '80rem', height: '716.8px', marginLeft: '1px'}}>
                        <Card.Header as="h6" style={{height: "44px", float: "left"}}>
                            <div style={{float: "left"}}>
                                <span style={{float: "left", marginRight: "10px"}}>Global Map View</span>
                                <DropdownButton style={{float: "left", marginRight: "10px"}} variant="light" size="sm"
                                                id="dropdown-basic-button" title="Heatmap">
                                    <Dropdown.Item onClick={this.handlePOIChooseOpen}
                                                   >POI</Dropdown.Item>
                                    <Dropdown.Item onClick={this.handleTrafficFlowChooseOpen} >Traffic
                                        Flow</Dropdown.Item>
                                </DropdownButton>
                                <DropdownButton style={{float: "left"}} variant="light" size="sm"
                                                id="dropdown-basic-button" title="Function Area">
                                    <Dropdown.Item onClick={this.testGetRoute}>POI</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Traffic Flow</Dropdown.Item>
                                </DropdownButton>
                                <POIChooseDialog open={this.state.POIChooseClose} close={this.handlePOIChooseClose}
                                                 topoiheatmap={this.POIChooseDialog2POIHeatMap}/>
                            </div>
                            {/*<FontAwesomeIcon title="to save" icon="save" border pull="right" onClick={this.handleSave}/>*/}
                            {this.state.HeatMapMode &&
                            <div>
                                {POIMap[this.state.POIChooseDialog2POIHeatMapMsg.toString()]}
                                <HeatMapTimePicker/>
                                <label style={{marginLeft:20}}>
                                    <input id="checkTrafficFlow" type="checkbox" name="group0" className="filled-in"
                                           onClick={this.setStartDestination}/>
                                    <span>specify starting point and destination</span>
                                </label>
                                <FontAwesomeIcon title="Go back to Main Page" icon={faArrowAltCircleLeft} border
                                                 pull="right" onClick={this.closeHeatMapMode}/>
                            </div>
                            }

                        </Card.Header>
                        <div>
                            {!this.state.HeatMapMode &&
                            <WorldMap redraw={this.state.redraw} sendDetailViewMessage={this.worldMap2DetailView}/>}
                            {this.state.HeatMapMode &&
                            <POIHeatMap setStartDestination={this.state.setStartDestination} mode={this.state.HeatMapModes} frompoichoosedialog={this.state.POIChooseDialog2POIHeatMapMsg}/>}

                            {/*<div id="historyLog" ref={this.historyLog} style={{width:157,height:665,float:"left"}}>*/}
                            {/*</div>*/}
                        </div>
                    </Card>

                    <Card style={{float: "left", width: '24rem', height: '716.8px', marginLeft: '1px'}}>
                        <Card.Header as="h6" style={{height: "44px"}}>Snapshot Panel
                            <FontAwesomeIcon title="Add" icon={faPlus}
                                             pull="right" onClick={this.addHistory}/>
                        </Card.Header>
                        <Card style={{float: "left", width: '23.8rem', height: '167px'}}>
                            <div id={"hmap0"} style={{height: 168, width: '23.8rem'}}></div>
                        </Card>
                        <Card style={{float: "left", width: '23.8rem', height: '167px'}}>
                            <div id={"hmap1"} style={{height: 168, width: '23.8rem'}}></div>
                        </Card>
                        <Card style={{float: "left", width: '23.8rem', height: '167px'}}>
                            <div id={"hmap2"} style={{height: 168, width: '23.8rem'}}></div>
                        </Card>
                        <MapHistory/>
                    </Card>
                </div>
                <div>
                    <Card style={{float: "left", width: '54rem', height: '350px'}}>
                        <Card.Header as="h6" style={{height: "44px"}}>Hierarchical Bar Chart</Card.Header>
                        <RowChart redraw={this.state.redraw} passTop3POI={this.getTop3POI}/>
                    </Card>
                    <Card style={{float: "left", width: '36rem', height: '350px'}}>
                        <Card.Header as="h6" style={{height: "44px"}}>Multi-line Chart
                            <Button variant="light" size="sm"
                                    style={{marginRight: "5px", marginLeft: "10px"}}>All</Button>
                            <Button variant="light" size="sm" onClick={this.handleCleanSelection}
                                    style={{marginRight: "5px"}}>Pick-up
                            </Button>
                            <Button variant="light" size="sm" onClick={this.handleCleanSelection}
                                    style={{marginRight: "2px"}}>Drop-off
                            </Button>
                        </Card.Header>
                        <MultiLineChart redraw={this.state.redraw} passLineData={this.getLineData}/>
                    </Card>
                    <Card style={{float: "left", width: '30rem', height: '350px'}}>
                        <Card.Header as="h6" style={{height: "44px"}}>Detail View
                            {/*<FontAwesomeIcon title="next" icon={faAngleDoubleRight} border pull="right" />*/}
                            {/*<FontAwesomeIcon title="previous" icon={faAngleDoubleLeft} border pull="right" />*/}
                        </Card.Header>
                        <DetailView recBound={this.state.recBound2DetailView}
                                    getDetailViewMessage={this.state.getDetailViewMessage}/>
                    </Card>
                </div>

            </div>
        )
    }
}

export default MapContainer;
