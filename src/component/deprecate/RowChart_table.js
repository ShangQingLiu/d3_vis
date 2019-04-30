import React, {Component} from 'react'
import * as d3 from 'd3'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'


class RowChart extends Component {
    constructor(props) {
        super(props);
        this.rc0 = React.createRef();
    }

    componentDidMount() {
        var margin = {top: 20, right: 120, bottom: 0, left: 50},
            width = 800 - margin.left - margin.right,
            height = 530 - margin.top - margin.bottom;

        var x = d3.scaleLinear()
            .range([0, width]);

        var barHeight = 20;

        var color = d3.scaleOrdinal()
            .range(["steelblue", "#ccc"]);
        var duration = 750,
            delay = 25;

        var partition = d3.partition()
            .size(function (d) {
                return d.size;
            });

        var xAxis = d3.axisTop(x);

        // append the header row

        initTable(this.rc0.current);
        function initTable(rc0){
            Promise.all([d3.json('POI1.json')]).then(([data1])=>{
                var rootDom = d3.select(rc0);
                // var svg = rootDom.append("svg")
                //     .attr("width", width + margin.left + margin.right)
                //     .attr("height", height + margin.top + margin.bottom)
                //     .append("g")
                //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                const tableHead = ["category", "POI1", "POI2", "POI3", "POI4", "POI5"];
                const data =[
                    { "date" : "2013-01-01", "close" : 45 },
                    { "date" : "2013-02-01", "close" : 50 },
                    { "date" : "2013-03-01", "close" : 55 },
                    { "date" : "2013-04-01", "close" : 50 },
                    { "date" : "2013-05-01", "close" : 45 },
                    { "date" : "2013-06-01", "close" : 50 },
                    { "date" : "2013-07-01", "close" : 50 },
                    { "date" : "2013-08-01", "close" : 55 }
                ];
                var table = rootDom.append("table");
                var thead = table.append('thead');
                var	tbody = table.append('tbody');
                // create a row for each object in the data
                thead.append('tr')
                    .selectAll('th')
                    .data(tableHead).enter()
                    .append('th')
                    .text(function (column) { return column; });
                //create data for each row
                var rows = tbody.selectAll('tr')
                    .data(function () {
                        // console.log("data1",data1.children);
                        return data1.children
                    })
                    .enter()
                    .append('tr');
                // create a cell in each row for each column
                var cells = rows.selectAll('td')
                    .data(function (row) {
                        console.log("row",row);
                        return tableHead.map(function (column,i) {
                            return {column:column,value:row[i]};
                        });
                    })
                    .enter()
                    .append('td')
                    .text(function (d) { console.log(d);return d.value; });
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
