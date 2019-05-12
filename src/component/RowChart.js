import React, {Component} from 'react'
import * as d3 from 'd3'
import axios from 'axios'
import {global,POIMap} from "../constants/constant";


class RowChart extends Component {
    constructor(props) {
        super(props);
        this.rc0 = React.createRef();
    }

    state={
        xScale:{},
        donePassPOI:false,
    };
    componentDidMount() {
        this.initTable();
    }

    componentWillUpdate(nextProps){
        if(nextProps.redraw !== this.props.redraw){
            this.redrawTable()
        }

    }
    initTable() {
        let cWidth = 70;
        Promise.all([d3.json('POI1.json'), d3.json('POI2.json'), d3.json('POI3.json'), d3.json('POI4.json'), d3.json('POI0.json')
        ]).then((inputData) => {
            var myrootDom = d3.select(this.rc0.current);
            var mysvg = myrootDom.append("svg")
                .attr("width", 1400)
                .attr("height", 310);
            let foreignObject = mysvg.append("foreignObject")
                .attr("width", 1400)
                .attr("height", 310);
            let table = foreignObject.append("xhtml:body")
                .append("table")
                .attr("text-align","center")
                .attr('style','font-size:0.5rem')
                // .attr("cellpadding","10")
                .attr('bordercolor',"#ffffff")
                .attr("border", "5")
            //POI symbol map
            global.poimap = new Map();
            let poimap = global.poimap;
            poimap.set("0", 'art-en.svg');
            poimap.set("1", 'collage-university.svg');
            poimap.set("2", 'food.svg');
            poimap.set("3", 'nightlife.svg');
            poimap.set("4", 'outdoor.svg');
            poimap.set("5", 'professional.svg');
            poimap.set("6", 'residence.svg');
            poimap.set("7", 'shop.svg');
            poimap.set("8", 'travel.svg');
            let tr1 = table.append("tr");
            tr1.append("th")
                .attr("bgcolor", "LightGrey");
            //poi row
            for (let i = 0; i < 9; i++) {
                let th = tr1.append("th")
                    .attr("width", cWidth)
                    .attr("height", 90)
                    .attr("bgcolor", "LightGrey");

                th.append("embed")
                    .attr("src", function () {
                        return poimap.get(i.toString())
                    })
                    .attr("display", "block")
                    .attr("width", 30)
                    .attr("height", 30);
                th.append("p")
                    .text(POIMap[i].replace(/_/g," "))
                    .attr("font-size",2)


            }
            for (let i = 0; i < 5; i++) {
                let da = inputData[i];
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
                var node = d3.hierarchy(da);
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
                //x-scale
                let xScale = d3.scaleLinear()
                    .range([0, 40]);
                xScale.domain([0, d3.extent(node.children.map(function (child) {
                    return child.value;
                }))[1]]).nice();
                let tr2 = table.append("tr");
                for (let j = 0; j < 10; j++) {
                    if (j === 0) {
                        let td = tr2.append("td")
                            .attr("width", 68)
                            .attr("height", 40)
                            .attr("vertical-align","bottom")
                        td .append("svg")
                            .attr("width", 10)
                            .attr("height", 10)
                            .attr("float","left")
                            .append("rect")
                            .attr("width", 10)
                            .attr("height", 10)
                            .attr("fill", d3.schemeCategory10[i]);
                        td.append("span")
                            .text("Function" + (i + 1).toString())
                            .attr("width", "40px")
                            .attr("font-size", "10px")
                            .attr("style","color:black,width:40px,height:40px")
                            .attr("float","left")
                    }
                    else {
                        tr2.append("td")
                            .attr("text-align","left")
                            .append("svg")
                            .attr("width", 40)
                            .attr("height", 35)
                            .append("rect")
                            .attr("class","poiRect"+i.toString())
                            .attr("width", xScale(node.children[j - 1].value))
                            .attr("height", 40)
                            .attr("fill", d3.schemeCategory10[i])
                    }
                    if (i % 2 !== 0) {
                        tr2.attr("bgcolor", "LightGrey");
                    }
                }
                //create inside funciton
                // for (let j = 0; j < 10; j++) {
                //     if (j === 0) {
                //         tr2.append("td")
                //             .text("Function" + (i + 1).toString())
                //             .attr("width", 40)
                //             .attr("height", 40)
                //             .attr("style","color:"+d3.schemeCategory10[i])
                //     }
                //     else {
                //         tr2.append("td")
                //             .attr("text-align","left")
                //             .append("svg")
                //             .attr("width", 40)
                //             .attr("height", 35)
                //             .append("rect")
                //             .attr("class","poiRect"+i.toString())
                //             .attr("width", xScale(node.children[j - 1].value))
                //             .attr("height", 40)
                //             .attr("fill", d3.schemePastel1[i])
                //     }
                //     if (i % 2 !== 0) {
                //         tr2.attr("bgcolor", "LightGrey");
                //     }
                // }
            }
            let dataSize = inputData.length;
            for (let ite = 0; ite < dataSize; ite++) {
                // let data = inputData[ite];
                // var rootDom = d3.select(rc0);
                // var svg = rootDom.append("svg")
                //     .attr("width", width + margin.left + margin.right)
                //     .attr("height", height + margin.top + margin.bottom)
                //     .append("g")
                //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                //
                // //add rect background
                // svg.append("rect")
                //     .attr("class", "background")
                //     .attr("width", width)
                //     .attr("height", height);
                //
                // //add g for x axis
                // svg.append("g")
                //     .attr("class", "x axis");
                //
                // //add g for y axis
                // svg.append("g")
                //     .attr("class", "y axis")
                //     .append("line");
                //
                // //x-scale
                // var xScale = d3.scaleLinear()
                //     .range([0, width]);
                //
                // //xAxis
                // var xAxis = d3.axisTop(xScale)
                //     .ticks(2);
                // //define partition
                // var partition = d3.partition()
                //     .size(function (d) {
                //         if ("children" in d) {
                //             let r = 0;
                //             for (let i = 0; i < d.children.length; i++) {
                //                 r += d.children[i].size;
                //             }
                //             return r;
                //         }
                //         else {
                //             return d.size;
                //         }
                //     });
                //
                // //create a hierarchy node by POI data
                // var node = d3.hierarchy(data);
                // //sort by size
                // partition(node)
                //     .sum(function (d) {
                //         if ("children" in d) {
                //             let r = 0;
                //             for (let i = 0; i < d.children.length; i++) {
                //                 r += d.children[i].size;
                //             }
                //             return r;
                //         }
                //         else {
                //             return d.size;
                //         }
                //     })
                //     .sort(function (a, b) {
                //         return a.size - b.size;
                //     })
                //     .descendants();

                //create x domain from node.value
                // xScale.domain([0, d3.extent(node.children.map(function (child) {
                //     return child.value;
                // }))[1]]).nice();
                // svg.selectAll('.x.axis')
                //     .call(xAxis);

                //draw bar
                // var bar = svg.insert("g", ".y.axis")
                //     .attr("class", "enter")
                //     .attr("transform", "translate(0,5)")
                //     .selectAll("g")
                //     .data(node.children)
                //     .enter().append("g")
                //     .style("cursor", function (d) {
                //         return !d.children ? null : "pointer";
                //     });
                // // .on("click", down);
                // bar.append("rect")
                //     .attr("width", function (d) {
                //         return xScale(d.value);
                //     })
                //     .attr("height", barHeight)
                //     .attr("fill", "steelblue")
                //     .attr("transform", stack());


                // function stack() {
                //     var y0 = 0;
                //     return function (d) {
                //         var tx = "translate(" + 0 + "," + y0 * (barHeight * 1.2) + ")";
                //         y0++;
                //         return tx;
                //     };
                // }
                //
                // // drawRC(node,0);
                // function drawRC(d, i) {
                //     //set animation time
                //     let duration = 750;
                //     let delay = 25;
                //     let end = duration + d.children.length * delay;
                //     //prevent data error
                //     if (!("children" in d)) return;
                //
                //     // Mark any currently-displayed bars as exiting.
                //     var exit = svg.selectAll(".enter")
                //         .attr("class", "exit");
                //     // Entering nodes immediately obscure the clicked-on bar, so hide it.
                //     exit.selectAll("rect").filter(function (p) {
                //         return p === d;
                //     })
                //         .style("fill-opacity", 1e-6);
                // }
            }
        })
    }

    redrawTable() {
        let recs = Object.values(global.selectGroups._layers);
        let p2 = recs[0]._latlngs[0][1];
        let p4 = recs[0]._latlngs[0][3];
        let lu = [p2.lat, p2.lng].toString();
        let rb = [p4.lat, p4.lng].toString();
        let ty = "partial".toString();
        let params = {
            bound1: lu,
            bound2: rb,
            ty:ty
        };
        let poisorted;
        Promise.all([
            axios.get(global.server + '/vis1/poi_total', {params})
        ]).then(([comedata]) => {
            let data = comedata["data"]["data"];
            //choose all poi rect
            //TODO:i orginal = 5
            // for(let i=0;i<1;i++){
            let i=0;
            let useData = [];
            //use to get top3 POI
            let getPOIAr = {};
            for(let j=0;j<9;j++){
                if(Object.keys(data[i]).length !== 0){
                    useData.push(data[i][POIMap[j]]);
                    getPOIAr[POIMap[j]] = data[i][POIMap[j]];
                }
            }
            poisorted = Object.keys(getPOIAr).sort(function (a,b) {
                return getPOIAr[b]-getPOIAr[a]
            });

            let xScale = d3.scaleLinear()
                .range([0, 80]);
            xScale.domain(d3.extent(useData));
            d3.selectAll(".poiRect"+ i.toString())
                .data(useData)
                .attr("width",(d)=>xScale(d));
            // }

        }).then(()=>{
            let m = [];
            for(let i =0;i<3;i++){
                m.push(poisorted[i]+".svg")
            }
            this.props.passTop3POI(m);
            this.setState(state=>({
                donePassPOI:!state.donePassPOI
            }));
        });
    }


    render() {
        return (
            <div id="rc0" ref={this.rc0} width="958px" height="350px" style={{fill: "none"}}></div>
        )
    }
}

export default RowChart;
