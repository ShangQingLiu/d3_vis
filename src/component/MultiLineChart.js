import React, {Component} from 'react';
import * as d3 from 'd3'
import dc from 'dc'
import crossfilter from 'crossfilter2'
import axios from 'axios';
import moment from 'moment'
import {global} from '../constants/constant'

class MultiLineChart extends Component {
    constructor(props) {
        super(props);
        this.mlc = React.createRef();
    }

    componentDidMount() {
        let height = 150;
        let width = 420;
        let param={
            day:[1,2]
        };
        Promise.all([
            axios.get(global.server + '/vis1/odon_1',{param})
            ,d3.csv('patterOD_On.csv')
            ]).then(([data,data1])=>{
                console.log("data1",data1)
            let margin = ({top: 20, right: 20, bottom: 20, left: 40});
            let svg = d3.select(this.mlc.current)
                .attr("width",width+margin.left+margin.right)
                .attr("height",height+margin.top+margin.bottom)
                .append("g") .attr("transform","translate("+margin.left+","+margin.right+")");
            let xScale = d3.scaleLinear()
                .domain([0,23])
                .range([0,width]);
            let yScale = d3.scaleLinear()
                .domain([0,d3.extent(data1.map(function (item) {
                    if(item instanceof Array){ return 0;
                    }
                    else{
                        let arr = [parseFloat(item["P0"]),parseFloat(item["P1"]),parseFloat(item["P2"]),parseFloat(item["P3"]),parseFloat(item["P4"])]
                        return d3.max(arr);
                    }
                }))[1]])
                .range([height, 0]);
            svg.append("g")
                .attr("class","x axis")
                .attr("transform","translate("+0+","+height+")")
                .call(d3.axisBottom(xScale));
            svg.append("g")
                .attr("class","y axis")
                .call(d3.axisLeft(yScale));

            Object.keys(data1[0]).map(function (value) {
                let line = d3.line()
                    .x( function(d,i){
                            return xScale(i)
                        }
                    )
                    .y(function (d,i) {
                        return yScale(parseFloat(d[value.toString()]))
                    });
                let lines = svg.append("path")
                    .datum(data1)
                    .attr("class","line")
                    .attr("d",function (d,i) {
                        return line(d) ;
                    })
                    .attr("fill","none")
                    .attr("stroke","steelblue");
                for(let k = 0; k<data1.length;k++){
                    let g_dot = svg.append("g");
                    let dot = g_dot.append("circle")
                        .datum(data1)
                        .attr("class","dot")
                        .attr("stroke","black")
                        .attr("fill","black")
                        .attr("r",1)
                        .attr("cx",()=>xScale(k))
                        .attr("cy",function(d){
                           return  yScale(d[k][value.toString()])
                        });
                    dot.on("mouseenter",function () {
                        console.log("g")
                       //TODO: if there alredy text is should judge
                       g_dot.append("text")
                           .style("font","10px sans-serif")
                           .attr("text-anchor","middle")
                           .attr("fill","black")
                           .attr("display",null)
                           .attr("x",d3.mouse(this)[0]+4)
                           .attr("y",d3.mouse(this)[1]-4)
                           .text(function(d){
                             return  yScale.invert(d3.mouse(this)[1])
                           })
                    });
                    dot.on("mouseleave",function () {
                       g_dot.selectAll("text")
                           .attr("display","none")
                    })
                }
                svg.call(hover,lines)
            });
            function hover(svg,path) {
                if ("ontouchstart" in document)path
                    .style("-webkit-tap-highlight-color", "transparent")
                    // .on("touchmove", moved);
                    // .on("touchstart", entered)
                    // .on("touchend", left)
                else path
                    // .on("mousemove", moved)
                    .on("mouseenter", entered)
                    .on("mouseleave", left);

                const dot = svg.append("g")
                    .attr("display","none")
                    .attr("transform","translate(0,0)")
                dot.append("circle")
                    .attr("r",2)
                    .attr("cx",5)
                    .attr("cy",10)
                    .attr("stroke","black")
                    .attr("stroke-width",1)
                    .attr("fill","none");
                dot.append("text")
                    .style("font","10px sans-serif")
                    .attr("text-anchor","middle")
                    .attr("x",0)
                    .attr("y",0);

                function moved() {
                   d3.event.preventDefault();

                   dot.attr("transform",function (d,i) {
                      // console.log(d3.mouse(this),d3.event.pageY)
                       console.log("move",(d3.mouse(this)[0]));
                       return `translate(${d3.mouse(this)[0]},4)`
                   });
                   dot.select("text").text("name");
                }
                function entered() {
                    dot.attr("transform",function (d,i) {
                        // console.log(d3.mouse(this),d3.event.pageY)
                        console.log(this)
                        console.log("enter",(d3.mouse(this)[0]));
                        return `translate(${d3.mouse(this)[0]},${d3.mouse(this)[1]})`
                    });
                    dot.select("circle")
                        .attr("r",2)
                        .attr("cx",5)
                        .attr("cy",10)
                        .attr("stroke","black")
                        .attr("stroke-width",1)
                        .attr("fill","none");
                    dot.select("text").text(yScale.invert(d3.mouse(this)[1]));
                    dot.attr("display",null);
                }
                function left(){
                    dot.attr("display","none")
                    .attr("transform",null)
                }
            }
        });
    }

    componentWillUpdate(nextProps){
        if(nextProps.redraw !== this.props.redraw){
            this.redraw()
        }
    }
    redraw(){
        let recs = Object.values(global.selectGroups._layers);
        let p2 = recs[0]._latlngs[0][1];
        let p4 = recs[0]._latlngs[0][3];
        let arr = p2.lat.toString()+','+p2.lng.toString()
            +','+p4.lat.toString()+','+p4.lng.toString();
        let params = {
            bound:arr
        };
        Promise.all(
            [axios.get(global.server + '/vis1/od_total', {params})]
        ).then(([data])=>{
            console.log(data);
            let data1 = data["data"]["data"];
            let height = 150;
            let width = 420;
            let svg = d3.select(this.mlc.current);
            svg.selectAll(".dot").remove();
            let xScale = d3.scaleLinear()
                .domain([0,23])
                .range([0,width]);
            let yScale = d3.scaleLinear()
                .domain([0,d3.extent(data1[0])[1]])
                .range([height, 0]);
            svg.selectAll("g.x.axis")
                .call(d3.axisBottom(xScale));
            svg.selectAll("g.y.axis")
                .call(d3.axisLeft(yScale));

            let line = d3.line()
                .x( function(d,i){
                    console.log("x",xScale(i))
                        return xScale(i)
                    }
                )
                .y(function (d,i) {
                    console.log("y",yScale(d))
                    return yScale(d)
                });
            svg.select("g")
                .selectAll(".line")
                .data(data1)
                .join(
                    enter=>enter.append("path")
                        .attr("class","line")
                        .attr("stroke","steelblue")
                        .attr("fill","none")
                        .attr("d",function (d) {
                            console.log(d);
                            return line(d)
                        }),
                    update=>update
                        .attr("stroke","purple")
                        .attr("d",function (d) {
                            console.log(d);
                           return line(d)
                        })
                        .on("mouseover", function (d,i) {
                            d3.select(this)
                                .attr("stroke","yellow")
                        })
                        .on("mouseout",function () {
                           d3.select(this)
                               .attr("stroke","purple")
                        })
                    ,
                    exit=>exit.attr("stroke","brown")
                        .call(exit=>exit.transition()
                            .duration(750)
                            .remove())
                )

        })
    }

    render() {
        return (
            <svg id="mlc" ref={this.mlc} ></svg>
            // <svg id="mlc" ref="mlc"></svg>
        )
    }
}

export default MultiLineChart;