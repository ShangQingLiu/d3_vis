import React, {Component} from 'react'
import * as d3 from 'd3'
import {global} from "../constants/constant";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import axios from 'axios';


class RowChart extends Component {
    constructor(props) {
        super(props);
        this.rc0 = React.createRef();
    }

    componentDidMount() {
        //declaration basic things
        var margin = {top: 20, right: 10, bottom: 0, left: 10},
            width = 140 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;
        var barHeight=10;
        initTable(this.rc0.current);
        function initTable(rc0){
            Promise.all([d3.json('POI1.json'),d3.json('POI2.json'),d3.json('POI3.json'),d3.json('POI4.json'),d3.json('POI0.json')
            ]).then((inputData)=>{
                let dataSize=inputData.length;
                for(let ite=0;ite<dataSize;ite++) {
                    let data = inputData[ite];
                    var rootDom = d3.select(rc0);
                    var svg = rootDom.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    //add rect background
                    svg.append("rect")
                        .attr("class", "background")
                        .attr("width", width)
                        .attr("height", height)

                    //add g for x axis
                    svg.append("g")
                        .attr("class", "x axis");

                    //add g for y axis
                    svg.append("g")
                        .attr("class", "y axis")
                        .append("line");

                    //x-scale
                    var xScale = d3.scaleLinear()
                        .range([0, width]);

                    //xAxis
                    var xAxis = d3.axisTop(xScale)
                        .ticks(2);
                    //define partition
                    var partition = d3.partition()
                        .size(function (d) {
                            if ("children" in d) {
                                let r = 0;
                                for (let i = 0; i < d.children.length; i++) {
                                    r += d.children[i].size;
                                }
                                return r;
                            }
                            else {
                                return d.size;
                            }
                        });

                    //create a hierarchy node by POI data
                    var node = d3.hierarchy(data);
                    //sort by size
                    partition(node)
                        .sum(function (d) {
                            if ("children" in d) {
                                let r = 0;
                                for (let i = 0; i < d.children.length; i++) {
                                    r += d.children[i].size;
                                }
                                return r;
                            }
                            else {
                                return d.size;
                            }
                        })
                        .sort(function (a, b) {
                            return a.size - b.size;
                        })
                        .descendants();

                    //create x domain from node.value
                    xScale.domain([0, d3.extent(node.children.map(function (child) {
                        return child.value;
                    }))[1]]).nice();
                    svg.selectAll('.x.axis')
                        .call(xAxis);

                    //draw bar
                    var bar = svg.insert("g", ".y.axis")
                        .attr("class", "enter")
                        .attr("transform", "translate(0,5)")
                        .selectAll("g")
                        .data(node.children)
                        .enter().append("g")
                        .style("cursor", function (d) {
                            return !d.children ? null : "pointer";
                        })
                    // .on("click", down);
                    bar.append("rect")
                        .attr("width", function (d) {
                            return xScale(d.value);
                        })
                        .attr("height", barHeight)
                        .attr("fill", "steelblue")
                        .attr("transform", stack());


                    function stack() {
                        var y0 = 0;
                        return function (d) {
                            var tx = "translate(" + 0 + "," + y0 * (barHeight * 1.2) + ")";
                            y0++;
                            return tx;
                        };
                    }

                    // drawRC(node,0);
                    function drawRC(d, i) {
                        //set animation time
                        let duration = 750;
                        let delay = 25;
                        let end = duration + d.children.length * delay;
                        //prevent data error
                        if (!("children" in d)) return;

                        // Mark any currently-displayed bars as exiting.
                        var exit = svg.selectAll(".enter")
                            .attr("class", "exit");
                        // Entering nodes immediately obscure the clicked-on bar, so hide it.
                        exit.selectAll("rect").filter(function (p) {
                            return p === d;
                        })
                            .style("fill-opacity", 1e-6);
                    }
                }
            })
        }
        //appendImage
        // svg.append("svg:image")
        //     .attr("xlink:href", "/cart.svg")
        //     .attr("width", 200)
        //     .attr("height", 200)
        //     .attr("x", 228)
        //     .attr("y", 53);

    }


    render() {
        return (
            <div id="rc0" ref={this.rc0} width="500px" height="400px" style={{fill: "none"}}>
                {/*<FontAwesomeIcon icon="palette" size="xs" transform="shrink-15 left-17 up-5.8"         color="rgb(23,118,182)"/>*/}
                {/*<FontAwesomeIcon icon="university" size="xs"     transform="shrink-15 left-17 up-4.2"      color="rgb(255,127,0)"/>*/}
                {/*<FontAwesomeIcon icon="utensils" size="xs"       transform="shrink-15 left-17 up-2.6"        color="rgb(36,161,33)"/>*/}
                {/*<FontAwesomeIcon icon="map-marked-alt" size="xs" transform="shrink-15 left-17 up-1.0"  color="rgb(216,36,31)"/>*/}
                {/*<FontAwesomeIcon icon="moon" size="xs"           transform="shrink-15 left-17 down-0.6"          color="rgb(149,100,191)"/>*/}
                {/*<FontAwesomeIcon icon="home" size="xs"           transform="shrink-15 left-17 down-2.1"          color="rgb(141,86,73)"/>*/}
                {/*<FontAwesomeIcon icon="football-ball" size="xs"  transform="shrink-15 left-17 down-3.7" color="rgb(229,116,195)"/>*/}
                {/*<FontAwesomeIcon icon="shopping-cart" size="xs"  transform="shrink-15 left-17 down-5.2" color="rgb(188,191,0)"/>*/}
                {/*<FontAwesomeIcon icon="route" size="xs"          transform="shrink-15 left-17 down-6.7"         color="rgb(0,190,208)"/>*/}
            </div>
        )
    }
}

export default RowChart;
