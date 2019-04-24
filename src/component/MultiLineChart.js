import React, {Component} from 'react';
import * as d3 from 'd3'
import dc from 'dc'
import crossfilter from 'crossfilter2'
import axios from 'axios';
import moment from 'moment'
import {global} from '../constants/constant'

class MultiLineChart extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        let height = 470;
        let width = 720;
        let param={
            day:[1,2]
        };
        Promise.all([
            axios.get(global.server + '/vis1/odon_1',{param})
            ]).then(([data])=>{
            let margin = ({top: 20, right: 20, bottom: 20, left: 40});
            let svg = d3.select(this.refs.mlc)
                .attr("width",width+margin.left+margin.right)
                .attr("height",height+margin.top+margin.bottom)
                .append("g")
                .attr("transform","translate("+margin.left+","+margin.right+")");
            let xScale = d3.scaleLinear()
                .domain([0,23])
                .range([0,width]);
            let yScale = d3.scaleLinear()
                .domain([0,18000])
                .range([height, 0]);
            let line = d3.line()
                .x( function(d,i){
                       return xScale(i)
                    }
                )
                .y(function (d,i) {
                    return yScale(d.value)
                });
            svg.append("g")
                .attr("class","x axis")
                .attr("transform","translate("+0+","+height+")")
                .call(d3.axisBottom(xScale));
            svg.append("g")
                .attr("class","y axis")
                .call(d3.axisLeft(yScale));

            svg.append("path")
                .datum(data["data"]["data"])
                .attr("class","line")
                .attr("d",function (d,i) {
                   return line(d[i].value) ;
                })
                .attr("fill","none")
                .attr("stroke","steelblue")
            svg.append("path")
                .datum(data["data"]["data"])
                .attr("class","line")
                .attr("d",function (d,i) {
                    return line(d[1].value) ;
                })
                .attr("fill","none")
                .attr("stroke","steelblue")
         });

    }


    render() {
        return (
            <svg id="mlc" ref="mlc" ></svg>
            // <svg id="mlc" ref="mlc"></svg>
        )
    }
}

export default MultiLineChart;