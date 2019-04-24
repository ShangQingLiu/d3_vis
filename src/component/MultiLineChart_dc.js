import React, {Component} from 'react';
import * as d3 from 'd3'
import dc from 'dc'
import crossfilter from 'crossfilter2'

class MultiLineChart extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        var chart =  dc.lineChart(this.refs.mlc);
        Promise.all([
            d3.csv('people.csv')
            ]).then(([data1])=>{
            function print_filter(filter){
                var f=eval(filter);
                if (typeof(f.length) != "undefined") {}else{}
                if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
                if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
                console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
            }
            var mycrossfilter = crossfilter(data1);
            var ageDimension = mycrossfilter.dimension(function(data) {
                return ~~((Date.now() - new Date(data.DOB)) / (31557600000))
            });
            var i= 0;
            var ageGroup = ageDimension.group().reduceSum(function (d) {
               return ++i;
            });
            chart
                .width(500)
                .height(250)
                .x(d3.scaleLinear().domain([15,70]))
                .brushOn(false)
                .yAxisLabel("Count")
                .xAxisLabel("Age")
                .dimension(ageDimension)
                .group(ageGroup);
            chart.render();
        });

    }

    shouldComponentUpdate() {
        // return false;
        return true;
    }

    render() {
        return (
            <div id="mlc" ref="mlc" style={{fill:"none"}}></div>
            // <svg id="mlc" ref="mlc"></svg>
        )
    }
}

export default MultiLineChart;