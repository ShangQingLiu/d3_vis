import React, {Component} from 'react';
import * as d3 from 'd3'
import dc from 'dc'
import crossfilter from 'crossfilter2'
import moment from 'moment'

class MultiLineChart extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        let height = 250;
        let width = 500;
        let svg = d3.select(this.refs.mlc)
            .attr("width",width)
            .attr("height",height);
        Promise.all([
            d3.json('data.json')
            ]).then(([data])=>{
            let margin = ({top: 20, right: 20, bottom: 30, left: 30})
            console.log([new Date(moment(d3.extent(data.dates)[0]).year(),moment(d3.extent(data.dates)[0]).month()+1,moment(d3.extent(data.dates)[0]).dayOfYear(),moment(d3.extent(data.dates)[0]).hour(),moment(d3.extent(data.dates)[0]).minute(),moment(d3.extent(data.dates)[0]).second()),
                new Date(moment(d3.extent(data.dates)[1]).year(),moment(d3.extent(data.dates)[1]).month()+1,moment(d3.extent(data.dates)[1]).dayOfYear(),moment(d3.extent(data.dates)[1]).hour(),moment(d3.extent(data.dates)[1]).minute(),moment(d3.extent(data.dates)[1]).second())])
            let x = d3.scaleTime()
                .domain([new Date(moment(d3.extent(data.dates)[0]).year(),moment(d3.extent(data.dates)[0]).month()+1,moment(d3.extent(data.dates)[0]).dayOfYear(),moment(d3.extent(data.dates)[0]).hour(),moment(d3.extent(data.dates)[0]).minute(),moment(d3.extent(data.dates)[0]).second()),
                new Date(moment(d3.extent(data.dates)[1]).year(),moment(d3.extent(data.dates)[1]).month()+1,moment(d3.extent(data.dates)[1]).dayOfYear(),moment(d3.extent(data.dates)[1]).hour(),moment(d3.extent(data.dates)[1]).minute(),moment(d3.extent(data.dates)[1]).second())])
                .range([margin.left, width - margin.right]);
            let y = d3.scaleLinear()
                .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
                .range([height - margin.bottom, margin.top]);
            let xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
            let yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .call(g => g.select(".domain").remove())
                .call(g => g.select(".tick:last-of-type text").clone()
                    .attr("x", 3)
                    .attr("text-anchor", "start")
                    .attr("font-weight", "bold")
                    .text(data.y));
            let line = d3.line()
                .defined(d => !isNaN(d))
                .x( function(d,i){
                        return x(new Date(moment(data.dates[i]).year(),moment(data.dates[i]).month()+1,moment(data.dates[i]).dayOfYear(),moment(data.dates[i]).hour(),moment(data.dates[i]).minute(),moment(data.dates[i]).second()))
                    }
                )
                .y(d => y(d));
            svg.append("g")
                .call(xAxis);

            svg.append("g")
                .call(yAxis);

            const path = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .selectAll("path")
                .data(data.series)
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("d", d => line(d.values));

            svg.call(hover, path);

            function hover(svg, path) {
                svg
                    .style("position", "relative");

                if ("ontouchstart" in document) svg
                    .style("-webkit-tap-highlight-color", "transparent")
                    .on("touchmove", moved)
                    .on("touchstart", entered)
                    .on("touchend", left)
                else svg
                    .on("mousemove", moved)
                    .on("mouseenter", entered)
                    .on("mouseleave", left);

                const dot = svg.append("g")
                    .attr("display", "none");

                dot.append("circle")
                    .attr("r", 2.5);

                dot.append("text")
                    .style("font", "10px sans-serif")
                    .attr("text-anchor", "middle")
                    .attr("y", -8);

                function moved() {
                    d3.event.preventDefault();
                    const ym = y.invert(d3.event.layerY);
                    const xm = d3.event.layerX;
                    const i1 = d3.bisectLeft(data.dates, xm, 1);
                    const i0 = i1 - 1;
                    const i = xm - x(parseInt(moment(data.dates[i0],moment.ISO_8601).format("X"))) > x(parseInt(moment(data.dates[i1],moment.ISO_8601).format("X"))) - xm ? i1 : i0;
                    console.log(i)
                    const s = data.series.reduce((a, b) => Math.abs(a.values[i] - ym) < Math.abs(b.values[i] - ym) ? a : b);
                    path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
                    dot.attr("transform", `translate(${xm},${y(s.values[i])})`);
                    dot.select("text").text(s.name);
                }

                function entered() {
                    path.style("mix-blend-mode", null).attr("stroke", "#ddd");
                    dot.attr("display", null);
                }

                function left() {
                    path.style("mix-blend-mode", "multiply").attr("stroke", null);
                    dot.attr("display", "none");
                }
            }
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