import React, {Component} from 'react';
import L from 'leaflet';
import '@elfalem/leaflet-curve'
import axios from 'axios';
import * as d3 from 'd3';
import {global, POIColorArray, POIMap} from "../constants/constant";
import 'leaflet-arc'
//material-ui
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

class WorldMap extends Component {
    constructor(props) {
        super(props)
        this.map = React.createRef()
        this.state = {
            showCheckDetailView: false,
        }
    }

    shouldComponentUpdata() {
        return false;
    }

    componentDidMount() {



        this.cleanLayerPoint();
        global.map = L.map('map', {zoomControl: false, attributeControl: false}).setView([30.27, 120.2], 11);
        global.selectGroups = new L.layerGroup();
        L.tileLayer('https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ', {
            maxZoom: 15
            // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        }).addTo(global.map);
        global.map.on('zoomend',()=>{
                this.drawGrid(global.map)
            }
        );
        this.drawGrid(global.map);

    }



    cleanLayerPoint=()=>{
        let params={
            detailView:["init"]
        };
        axios.post(global.server + '/vis1/detailViewNum/', params);
        global.detailView = [];
    };
    drawGrid = (map) => {
        console.log("drawGrid");
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
        Promise.all([
            d3.json("./RP.json"), axios.get(global.server + '/vis1/od_aster'),
            axios.get(global.server + '/vis1/poi_total', {params})
        ]).then(([data, asterData, poiData]) => {
            console.log(asterData);
            let type = [data.P0, data.P1, data.P2, data.P3, data.P4];
            let key = ['P0', 'P1', 'P2', 'P3', 'P4'];

            // let flag=true;
            //draw square by LLY
            if (Object.keys(global.innerCircleGroups).length !== 0) {
                global.innerCircleGroups.clearLayers();
                global.innerCircleGroup = [];
            }
            for (let ii = 0; ii < type.length; ii++) {
                for (let jj = 0; jj < type[ii].length; jj++) {
                    let grid = type[ii][jj];
                    let i = parseInt(grid.slice(0, 2));
                    let j = parseInt(grid.slice(2, 4));
                    let bound = [[bottom + i * heightDistance, left + j * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1) * wideDistance]];
                    let colorScale = d3.scaleOrdinal()
                        .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                        .range([d3.schemePastel1[0], d3.schemePastel1[1], d3.schemePastel1[2], d3.schemePastel1[3], d3.schemePastel1[4]]);
                    let color = colorScale(key[ii]);
                    let incolorScale = d3.scaleOrdinal()
                        .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                        .range([d3.schemeCategory10[0], d3.schemeCategory10[1], d3.schemeCategory10[2], d3.schemeCategory10[3], "#f5b400"]);
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
                        c1.on("click", (e)=>this.checkGetDetailView(e));
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
                        global.innerCircleGroup.push(c1, c2, c3)
                        global.innerCircleGroups = L.layerGroup(global.innerCircleGroup)
                        map.addLayer(global.innerCircleGroups);
                        // }
                    }
                    else {
                        // if(Math.log(Math.pow(1.00005,flowSum()))/1.5>1) {
                        let c1 = L.circle([cx, cy], {
                            radius: outR, color: incolor, opacity: 0.78, fill: true, fillOpacity:
                            Math.log(Math.pow(1.00005, flowSum())) / 1.5 + 0.1
                            , stroke: false
                        });
                        global.innerCircleGroup.push(c1)
                        global.innerCircleGroups = L.layerGroup(global.innerCircleGroup)
                        map.addLayer(global.innerCircleGroups);
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
                            let colorA = "#D38ABD";
                            let colorB = "#8CD1E0";
                            if (asterData["data"]["data"][numGrid][myI][1] > asterData["data"]["data"][numGrid][myI][2]) {
                                inCurve = L.curve(this.describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
                                    {
                                        color: ocolor[5],
                                        fill: true,
                                        stroke: true,
                                        fillColor: 'g5732a8',
                                        fillOpacity: 1,
                                        weight: 1
                                    });
                                outCurve = L.curve(this.describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                    {
                                        color: ocolor[5],
                                        fill: true,
                                        stroke: true,
                                        fillColor: '#4284f5',
                                        fillOpacity: 1,
                                        weight: 1
                                    });
                                global.curveGroup.push(inCurve);
                                global.curveGroup.push(outCurve);
                            }
                            else {
                                outCurve = L.curve(this.describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][2]),
                                    {
                                        color: ocolor[5],
                                        fill: true,
                                        stroke: true,
                                        fillColor: '#4284f5',
                                        fillOpacity: 1,
                                        weight: 1
                                    });
                                inCurve = L.curve(this.describeArc(cy, cx, 3.5, 7.9, angs + myI * anStep, ange + myI * anStep, asterData["data"]["data"][numGrid][myI][1]),
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
                                global.curveGroup.push(outCurve);
                                global.curveGroup.push(inCurve);
                            }
                        }
                        global.curveGroups = L.layerGroup(global.curveGroup);
                        map.addLayer(global.curveGroups);
                        // }
                    }
                    else {
                        if (Object.keys(global.curveGroups).length !== 0) {
                            global.curveGroups.clearLayers();
                            global.curveGroup = [];
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
                                global.POIGroup.push(poiCircle);
                            }
                        }
                        global.POIGroups = L.layerGroup(global.POIGroup);
                        map.addLayer(global.POIGroups);
                        // }
                    }
                    else {
                        if (Object.keys(global.POIGroups).length !== 0) {
                            global.POIGroups.clearLayers();
                            global.POIGroup = [];
                        }
                    }
                }

            }
        });
    }
    describeArc = (lng, lat, innerRadius, outerRadius, startAngle, endAngle, value) => {
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
    checkGetDetailView = (e) => {
        let wideStep = ( global.right-global.left)/global.blockCount_col
        let heightStep = ( global.top-global.bottom)/global.blockCount_row
        let x = Math.ceil((e.latlng.lng-global.left)/wideStep);
        let y = Math.ceil((e.latlng.lat-global.bottom)/heightStep);
        global.detailView.push(x);
        global.detailView.push(y);
        this.setState({
            showCheckDetailView: true
        })

    };
    handleDialogClose = () => {
        console.log("close");
        this.setState({
            showCheckDetailView:false
        })
    };
    getLayerPoint = ()=>{
        //close dialog
        this.setState({
            showCheckDetailView:false
        });
        let params={
            detailView: global.detailView
        };
        Promise.all([
            axios.post(global.server + '/vis1/detailViewNum/', params)
        ]).then(()=>{
            this.props.sendDetailViewMessage();
            global.detailView = [];
        });
    };

    render() {
        return (
            <div>
                <div id="map" ref={this.map} style={{float: "left"}}>
                </div>
                <Dialog
                    open={this.state.showCheckDetailView}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Do you want to add this Glyph to Detail View"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            You could save the specific Glyph for comparision inside Detail View.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDialogClose} color="primary">
                            No
                        </Button>
                        <Button onClick={this.getLayerPoint} color="primary" autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default WorldMap;
