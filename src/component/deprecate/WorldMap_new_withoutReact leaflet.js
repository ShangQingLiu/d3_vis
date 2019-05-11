import React, {Component} from 'react';
import L from 'leaflet';
import '@elfalem/leaflet-curve'
import axios from 'axios';
import * as d3 from 'd3';
import {global,POIColorArray,POIMap} from "../constants/constant";
import 'leaflet-arc'
class WorldMap extends Component {
    constructor(props) {
        super(props)
        this.map = React.createRef()
    }

    shouldComponentUpdata() {
        return false;
    }

    componentDidMount(){
        function describeArc(lng, lat, innerRadius, outerRadius, startAngle, endAngle,value){
            let innerTest = 0.0017884;
            let outerTest = 0.00400;
            if(value>0){
                if(Math.log(value)/4000>0)
                outerTest = Math.log(value)/4000+innerTest;
                else{
                    outerTest = 0+innerTest;
                }
            }
            else{
                outerTest = 0+innerTest;
            }
            // if (outerTest+0.0005<0.004){
            //     outerTest = outerTest+0.0005;
            // }
            let angle = 1/360*Math.PI;
            //that many of points
            let inA = [];
            let outA =[];
            //((endAngle-startAngle)*Math.PI/180/angle+1) is number of the points that would produce in 1/720*PI scale
            for(let i = 0; i < 30/*((endAngle-startAngle)*Math.PI/180/angle+1)*/;i++ ){
                // let p = L.latLng(lat,lng);
                // let ep = global.map.latLngToLayerPoint(p);

                let inx = lng + innerTest * Math.cos(startAngle/180*Math.PI+ i * angle)*1.17;
                let iny = lat + innerTest * Math.sin(startAngle/180*Math.PI+i * angle);
                // let rp = L.point(inx,iny);
                // let ap = global.map.layerPointToLatLng(rp);
                inA.push([iny,inx]);

                let outx = lng + outerTest * Math.cos(startAngle/180*Math.PI+i * angle)*1.17;
                let outy = lat + outerTest * Math.sin(startAngle/180*Math.PI+i * angle);
                // rp = L.point(outx,outy);
                // ap = global.map.layerPointToLatLng(rp);
                outA.push([outy,outx]);
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
                d=d.concat(outA);
                d.push(inA[inA.length-1]);
            return d;
        }
        global.map = L.map('map').setView([30.27, 120.2], 11);
        global.selectGroups = new L.layerGroup();
        L.tileLayer('https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ', {
            // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        }).addTo(global.map);
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

            drawGrid();
            global.map.on('zoomend',function () {
              drawGrid();
            });
            function drawGrid(){
                let ty = "all".toString();
                let params = {
                    ty:ty
                };
                Promise.all([
                    d3.json("./RP.json"), axios.get(global.server + '/vis1/od_aster'),
                    axios.get(global.server + '/vis1/poi_total', {params})
                ]).then(([data, asterData,poiData]) => {
                    console.log(poiData);
                    let type = [data.P0, data.P1, data.P2, data.P3, data.P4];
                    let key = ['P0', 'P1', 'P2', 'P3', 'P4'];

                    // let maxTrFlow = d3.extent(asterData["data"]["data"],function (d,i) {
                    //     let result = 0;
                    //    for(let i=0;i<24;i++){
                    //        result +=d[i][3];
                    //    }
                    //    return result
                    // })[1];
                    // 1.create d3 relation with div and append svg
                    // let width = 1088;//rem
                    // let height = 520;
                    // let innerR = 1;
                    // let outerR = 8;
                    // let svg = d3.select(global.map.getPanes().overlayPane).append("svg")
                    //     .attr("width", width)
                    //     .attr("height", height);
                    // let g = svg.append("g").attr("class", "leaflet-zoom-hide");

                    // let realbl= L.latLng(bottom,left);
                    // let realtl = L.latLng(up,left);
                    // let scaleR =(global.map.latLngToLayerPoint(realbl).y-global.map.latLngToLayerPoint(realtl).y)/24/10;
                    //TODO:remove flag
                    // let flag=true;
                    //draw square by LLY
                    for (let ii = 0; ii < type.length; ii++) {
                        for (let jj = 23; jj < 33/* type[ii].length*/; jj++) {
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
                                .range([d3.schemeSet1[0], d3.schemeSet1[1],d3.schemeSet1[2],d3.schemeSet1[3],"#f5b400"]);
                            let incolor = incolorScale(key[ii]);
                            let o1color = ['#62A7D1','#AF89C7','#F2A444','#818C94','#DB6F53','#67C294'];
                            let o2color = ['#F2A444','#818C94','#DB6F53','#67C294','#62A7D1','#AF89C7'];
                            let o3color = ['AF89C7','#F2A444','#818C94','#DB6F53','#67C294','#62A7D1'];
                            let o4color = ['#818C94','#DB6F53','#67C294','#62A7D1','#AF89C7','#F2A444'];
                            let o5color = ['#DB6F53','#67C294','#62A7D1','#AF89C7','#F2A444','#818C94'];
                            let customColorScale = d3.scaleOrdinal()
                                .domain(['P0', 'P1', 'P2', 'P3', 'P4'])
                                .range([o1color, o2color,o3color,o4color,o5color]);
                            let ocolor = customColorScale(key[ii]);
                            // L.rectangle(bound, {color: color, fill:false,opacity: 1, weight: 1,stroke:true,}).addTo(global.map);
                            // let newBound = [[bound[0][0] / 3, bound[0][1] / 3], [bound[1][0] / 3, bound[1][1] / 3]];
                            let ir = 200;
                            let cy = left + j * wideDistance+wideDistance/2;
                            let cx = bottom + i * heightDistance+heightDistance/2;
                            let oR = 450;
                            let outR = 640;
                            //inner circle
                            let flowSum = function(){
                                let sum = 0;
                                for(let i=0;i<24;i++){
                                    sum +=  parseInt(asterData["data"]["data"][30 * i + j][i])
                                }
                                return sum;
                            };
                            L.circle([cx,cy],{radius:ir,color:incolor,opacity:0.78,fill:true,fillOpacity:flowSum()/90000+0.1,stroke:true}).addTo(global.map);
                            L.circle([cx,cy],{radius:oR,color:"#cccccc",opacity:0.2,fill:false}).addTo(global.map);
                            L.circle([cx,cy],{radius:outR,color:"#cccccc",opacity:0.2,fill:false}).addTo(global.map);
                            let mapLevel = global.map.getZoom();
                            if(mapLevel>=15){
                                //do 24hr arc
                                let numGrid = 30 * i + j;
                                let angs = 0;
                                let ange = 15;
                                let anStep = 15;
                                for(let myI = 0;myI<24;myI++){
                                    let inCurve, outCurve;
                                    if(asterData["data"]["data"][numGrid][myI][1]>asterData["data"]["data"][numGrid][myI][2]){
                                        inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][1]),
                                            {color: ocolor[5], fill: true,stroke:true,fillColor:'#5732a8',fillOpacity:1,weight:1});
                                        outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][2]),
                                            {color: ocolor[5], fill: true,stroke:true,fillColor:'#4284f5',fillOpacity:1,weight:1});
                                    }
                                    else{
                                        outCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][2]),
                                            {color: ocolor[5], fill: true,stroke:true,fillColor:'#4284f5',fillOpacity:1,weight:1});
                                        inCurve = L.curve(describeArc(cy, cx, 3.5, 7.9, angs+myI*anStep, ange+myI*anStep, asterData["data"]["data"][numGrid][myI][1]),
                                            {color: ocolor[5], fill: true,stroke:true,fillColor:'#5732a8',fillOpacity:1,weight:1});

                                    }
                                    global.curveGroup.push(inCurve,outCurve)
                                }
                                global.curveGroups = L.layerGroup(global.curveGroup);
                                global.map.addLayer(global.curveGroups);
                            }
                            else{
                                if(Object.keys(global.curveGroups).length!==0){
                                    global.curveGroups.clearLayers();
                                    global.curveGroup = [];
                                }
                            }
                            //draw poi circle 9
                            for(let myI = 0;myI<9;myI++){
                                let poir = 0.0057;
                                let poiR = 20;
                                if(poiData["data"]["data"][30*i+j][POIMap[myI]]){
                                    // poiR = (poiData["data"]["data"][30*i+j][POIMap[myI]]/200>100)?100:poiData["data"]["data"][30*i+j][POIMap[myI]]/150;
                                    poiR = poiData["data"]["data"][30*i+j][POIMap[myI]]/200*40+30;
                                    if(poiR > 80){
                                        poiR = 80;
                                    }

                                }
                                // if(poiR> 30){
                                    let poix = cx + poir * Math.sin(2*Math.PI/9*myI)*0.87;
                                    let poiy = cy + poir * Math.cos(2*Math.PI/9*myI);
                                    L.circle([poix,poiy],{radius:poiR,color:POIColorArray[myI],fillOpacity:1,opacity:1,fill:true,fillColor:POIColorArray[myI]}).addTo(global.map);
                                // }
                            }
                        }

                    }
                });
            }
    }

    render() {
        return (
            <div id="map" ref={this.map} style={{float:"left"}}>
            </div>
        )
    }
}

export default WorldMap;
