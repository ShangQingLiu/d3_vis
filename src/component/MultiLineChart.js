import React, {Component} from 'react';
import * as d3 from 'd3'
import axios from 'axios';
import {global} from '../constants/constant'

class MultiLineChart extends Component {
    constructor(props) {
        super(props);
        this.mlc = React.createRef();
    }

    componentDidMount() {
        let height = 200;
        let width = 500;
        let margin = ({top: 20, right: 20, bottom: 20, left: 55});
        let param={
            day:[1,2]
        };
        Promise.all([
            axios.get(global.server + '/vis1/odon_1',{param})
            ,d3.csv('patterOD_On.csv')
            ]).then(([data,data1])=>{
            let svg = d3.select(this.mlc.current)
                .attr("width",width+margin.left+margin.right)
                .attr("height",height+margin.top+margin.bottom)
                .append("g").attr("transform","translate("+margin.left+","+margin.right+")");
            let xScale = d3.scaleLinear()
                .domain([0,23])
                .range([0,width]);
            let yScale = d3.scaleLinear()
                .domain([0,d3.extent(data1.map(function (item) {
                    if(item instanceof Array){ return 0;
                    }
                    else{
                        let arr = [parseFloat(item["P0"]),parseFloat(item["P1"]),parseFloat(item["P2"]),parseFloat(item["P3"]),parseFloat(item["P4"])];
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
                .call(d3.axisLeft(yScale).ticks(5));
            svg.append("text")
                .attr("text-anchor","end")
                .attr("transform","rotate(+360)")
                .attr("y",-4)
                .attr("x",30)
                .text("number");
            svg.append("text")
                .attr("text-anchor","end")
                .attr("x",width+18)
                .attr("y",height+margin.top)
                .text("hour");
            Object.keys(data1[0]).map(function (value,i) {
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
                    .attr("stroke",function () {
                      return   d3.schemeCategory10[i]
                    })
                    .attr("stroke-width",5);
                for(let k = 0; k<data1.length;k++){
                    let g_dot = svg.append("g").attr("class","g_dot");
                    let dot = g_dot.append("circle")
                        .datum(data1)
                        .attr("class","dot")
                        .attr("stroke",function () {
                            return   d3.schemeCategory10[i]
                        })
                        .attr("fill","white")
                        .attr("r",3)
                        .attr("cx",()=>xScale(k))
                        .attr("cy",function(d){
                           return  yScale(d[k][value.toString()])
                        });
                    dot.on("mouseenter",function () {
                        // console.log("g")
                       //TODO: if there alredy text is should judge
                       g_dot.append("text")
                           .style("font","10px sans-serif")
                           .attr("text-anchor","middle")
                           .attr("fill","black")
                           .attr("display",null)
                           .attr("x",d3.mouse(this)[0]+4)
                           .attr("y",d3.mouse(this)[1]-4)
                           .text(function(d){
                             return  parseInt(yScale.invert(d3.mouse(this)[1])).toString();
                           })
                    });
                    dot.on("mouseleave",function () {
                       g_dot.selectAll("text")
                           .attr("display","none")
                    })
                }
                svg.call(hover,lines);
               return 0;
            });
            function hover(svg,path) {
                if ("ontouchstart" in document)path
                    .style("-webkit-tap-highlight-color", "transparent");
                    // .on("touchmove", moved);
                    // .on("touchstart", entered)
                    // .on("touchend", left)
                else path
                    // .on("mousemove", moved)
                    .on("mouseenter", entered)
                    .on("mouseleave", left);

                const dot = svg.selectAll(".g_dot")
                    .selectAll("circle");
                    // .attr("display","none");
                // function moved() {
                //    d3.event.preventDefault();
                //
                //    dot.attr("transform",function (d,i) {
                //       // console.log(d3.mouse(this),d3.event.pageY)
                //       //  console.log("move",(d3.mouse(this)[0]));
                //        return `translate(${d3.mouse(this)[0]},4)`
                //    });
                //    dot.select("text").text("name");
                // }
                function entered() {
                    // dot.attr("transform",function (d,i) {
                    //     // console.log(d3.mouse(this),d3.event.pageY)
                    //     // console.log(this)
                    //     // console.log("enter",(d3.mouse(this)[0]));
                    //     return `translate(${d3.mouse(this)[0]},${d3.mouse(this)[1]})`
                    // });
                    // dot.select("circle")
                    //     .attr("r",2)
                    //     .attr("cx",5)
                    //     .attr("cy",10)
                    //     .attr("stroke","black")
                    //     .attr("stroke-width",1)
                    //     .attr("fill","none");
                    // dot.select("text").text(yScale.invert(d3.mouse(this)[1]));
                    // dot.attr("display",null);
                }
                function left(){
                    // dot.attr("display","none")
                    // .attr("transform",null)
                }
            }
        });
    }

    componentWillUpdate(nextProps){
        if(nextProps.redraw !== this.props.redraw){
            this.redraw();
        }
    }
    redraw(){
        //TODO: this chould only use for single rectangle
        let height = 200;
        let width = 500;
        let margin = ({top: 20, right: 20, bottom: 20, left: 55});
        // console.log("selectGroups",global.selectGroups);
        let recs = Object.values(global.selectGroups._layers);

        let p2 = recs[Object.keys(global.selectGroups._layers).length-1]._latlngs[0][1];
        let p4 = recs[Object.keys(global.selectGroups._layers).length-1]._latlngs[0][3];
        let arr = p2.lat.toString()+','+p2.lng.toString()
            +','+p4.lat.toString()+','+p4.lng.toString();
        let params = {
            bound:arr
        };
        Promise.all(
            [axios.get(global.server + '/vis1/od_total', {params})]
        ).then(([data])=>{
            let data1 = data["data"]["data"];
            let svg = d3.select(this.mlc.current);
            //remove the dot first
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
                .call(d3.axisLeft(yScale).ticks(5));

            let line = d3.line()
                .x( function(d,i){
                    // console.log("x",xScale(i))
                        return xScale(i)
                    }
                )
                .y(function (d,i) {
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
                            return line(d)
                        }),
                    update=>update
                        .attr("stroke","#ffbccf")
                        .attr("d",function (d) {
                           return line(d)
                        })
                        .on("mouseover", function (d,i) {
                            // d3.select(this)
                                // .attr("stroke","yellow")
                        })
                        .on("mouseout",function () {
                           // d3.select(this)
                           //     .attr("stroke","purple")
                        })
                    ,
                    exit=>exit.attr("stroke","brown")
                        .call(exit=>exit.transition()
                            .duration(750)
                            .remove())
                );


                svg.selectAll(".g_dot").remove();
                let newg_dot = svg.append("g").attr("class","g_dot").attr("transform","translate("+margin.left+","+margin.right+")");
                let dot = newg_dot.selectAll("g")
                    .data(data1[0])
                    .join(
                        enter=>enter.append("circle")
                            .attr("class","enter")
                            .attr("stroke","black")
                            .attr("fill","white")
                            .attr("r",3)
                            .attr("cx",(d,i)=>xScale(i))
                            .attr("cy",function(d,i){
                                return  yScale(d)
                            }),
                        update=>update
                            .attr("r",3)
                            .attr("cx",(d,i)=>xScale(i))
                            .attr("cy",function(d){
                                return  yScale(d)
                            }),
                        exit=>exit.attr("stroke","LightGrey")
                            .call(exit=>exit.transition()
                                .duration(200)
                                .remove())
                    );
                dot.on("mouseenter",function () {
                    // console.log("g")
                    //TODO: if there alredy text is should judge
                    newg_dot.append("text")
                        .style("font","10px sans-serif")
                        .attr("text-anchor","middle")
                        .attr("fill","black")
                        .attr("display",null)
                        .attr("x",d3.mouse(this)[0]+4)
                        .attr("y",d3.mouse(this)[1]-4)
                        .text(function(d){
                            return  parseInt(yScale.invert(d3.mouse(this)[1])).toString();
                        })
                });
                dot.on("mouseleave",function () {
                    newg_dot.selectAll("text")
                        .attr("display","none")
                });
            this.props.passLineData(data1[0]);
        });
    }

    render() {
        return (
            <svg id="mlc" ref={this.mlc} ></svg>
            // <svg id="mlc" ref="mlc"></svg>
        )
    }
}

export default MultiLineChart;