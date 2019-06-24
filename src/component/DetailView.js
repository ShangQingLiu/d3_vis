import React, {Component} from 'react'
import * as d3 from 'd3'
import {global, POIColorArray} from "../constants/constant";
import axios from 'axios'

class DetailView extends Component {
    constructor(props) {
        super(props);
        this.glyph = React.createRef()
    }

    componentDidMount() {
    }

    draw = (centerColorIndex, arcData1, arcData2, POIData) => {
        let width = 240;
        let height = 240;
        let svg = d3.select(this.glyph.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        // let arcCircle = d3.arc()
        //     .innerRadius(0)
        //     .outerRadius(height / 10)
        //     .startAngle(Math.PI / 2)
        //     .endAngle(Math.PI * 2);
        // let arcCircleFactory = d3.arc()
        //     .innerRadius(0)
        //     .outerRadius(height / 10)
        //     .startAngle(function (d) {
        //         return Math.PI / 10 * d
        //     })
        //     .endAngle(function (d) {
        //         return Math.PI / 10 * (d + 1)
        //     });

        let max = d3.extent([d3.extent(arcData1)[1],d3.extent(arcData2)][1])[1]
        // console.log("max",max)

        let arcFactory1 = d3.arc()
            .innerRadius(height / 10)
            .outerRadius(function (d) {
                let da = arcData1[d];
                if (arcData2[d] > arcData1[d]) {
                    da = arcData2[d]
                }
                if( da/max* 55 + height / 10>85){
                    return 85
                }

                if(da/max* 55 + height / 10<=0){
                    return height / 10;
                }
                if (da > 0) {
                    return da/max* 55 + height / 10
                }

                else {
                    return height / 10;
                }
            })
            .startAngle(function (d) {
                return Math.PI / 12 * d + Math.PI / 2 - Math.PI / 2
            })
            .endAngle(function (d) {
                return Math.PI / 12 * (d + 1) + Math.PI / 2 - Math.PI / 2
            });
        let arcFactory = d3.arc()
            .innerRadius(height / 10)
            .outerRadius(function (d) {
                let da = arcData1[d];
                if (arcData1[d] >= arcData2[d]) {
                    da = arcData2[d]
                }
                if(da/max* 55 + height / 10>85){
                    return 85
                }
                if(da/max* 55 + height / 10<=0){
                    return height / 10;
                }
                if (da > 0) {

                    return da/max* 55 + height / 10
                }
                else {
                    return height / 10;
                }
            })
            .startAngle(function (d) {
                return Math.PI / 12 * d + Math.PI / 2 - Math.PI / 2
            })
            .endAngle(function (d) {
                return Math.PI / 12 * (d + 1) + Math.PI / 2 - Math.PI / 2
            });
        // let d1 = [];
        // let d2 = [];
        // for(let i=0;i<24;i++){
        //     d1.push(Math.random()*30+5);
        //     d2.push(Math.random()*50+5);
        // }
        // console.log("d1",d1);()=>'#3399ff'
        for (let index = 0; index < 24; index++) {
            let da, color;
            if (arcData1[index] > arcData2[index]) {
                da = arcData1[index]
                color = "#3399ff"
            }
            else {
                da = arcData2[index]
                color = "#623fa3"
            }
            // console.log("2",da)
            let g1 = svg.append("g")
                .data([index])
                .append("path")
                .attr("class", "arc")
            g1.attr("fill", color)
                .attr("stroke", "LightGrey")
                .attr("d", arcFactory1)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        }
        for (let index = 0; index < 24; index++) {
            let da, color;
            if (arcData1[index] > arcData2[index]) {
                da = arcData2[index]
                color = "#623fa3"
            }
            else {
                da = arcData1[index]
                color = "#3399ff"
            }

            // console.log("1",da)
            let g = svg.append("g")
                .data([index])
                .append("path")
                .attr("class", "arc")
                .attr("fill", color)
                .attr("stroke", "LightGrey")
                .attr("d", arcFactory)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        }

        svg.append("circle")
            .attr("stroke", "LightGrey")
            .attr("fill", d3.schemeCategory10[centerColorIndex])
            .attr("r", height / 10)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
        svg.append("circle")
            .attr("stroke", "LightGrey")
            .attr("fill", "none")
            .attr("r", 85)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
        svg.append("circle")
            .attr("stroke", "LightGrey")
            .attr("fill", "none")
            .attr("r", 120)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
        svg.append("rect")
            .attr('width', width)
            .attr('height', height)
            .attr("fill", "none")
            .attr("stroke", "black")
        let rScale = d3.scaleLinear()
            .domain([0, 20])
            .range([0, d3.extent(POIData)[1]]);
        for (let i = 0; i < 9; i++) {
            let poir = 102;
            let cx = width / 2;
            let cy = height / 2;
            let p1 = svg.append("g")
            let poiCircle = p1.append("circle")
                .attr("r", function () {
                    if (Math.log((POIData[i]) * 10000) * 10 > 10)
                        return 10;
                    if(Math.log((POIData[i]) * 10000) * 10<=0){
                        return 0;
                    }
                    return Math.log((POIData[i]) * 10000) * 10;
                })
                .attr("cx", cx + poir * Math.sin(2 * Math.PI / 9 * (i + 2) + Math.PI / 15))
                .attr('cy', cy + poir * Math.cos(2 * Math.PI / 9 * (i + 2) + Math.PI / 15))
                .attr('fill', POIColorArray[i]);
        }

    };

    componentWillUpdate(nextProps) {
        if (nextProps.recBound !== this.props.recBound) {
            let p1 = nextProps.recBound[0]
            let p2 = nextProps.recBound[1]
            let arr = p1.lat.toString() + ',' + p1.lng.toString()
                + ',' + p2.lat.toString() + ',' + p2.lng.toString();
            let params = {
                bound: arr
            };
            Promise.all([
                axios.get(global.server + '/vis1/od_on_total', {params}),
                axios.get(global.server + '/vis1/od_off_total', {params}),
                axios.get(global.server + '/vis1/detailViewPOI', {params}),
            ]).then(([pre_asterData1, pre_asterData2, pre_poidata]) => {
                let asterData1 = pre_asterData1["data"]["data"][0];
                let asterData2 = pre_asterData2["data"]["data"][0];
                let poidata = pre_poidata["data"]["data"];
                let fakeColorIndex = [3, 2];
                // console.log(asterData1);
                // console.log(asterData2);
                // console.log(poidata)
                //arcData1
                let arcData1 = [];
                let arcData2 = [];
                this.draw(fakeColorIndex[global.fakeIndex], asterData1, asterData2, poidata);
                global.fakeIndex++;
                //POIData


                // draw=(centerColorIndex,arcData1,arcData2,POIData)=>{

            })

        }
    }

    render() {
        return (
            <div style={{overflowX: "auto", whiteSpace: "nowrap"}} ref={this.glyph}></div>
        )
    }
}

export default DetailView