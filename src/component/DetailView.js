import React, {Component} from 'react'
import * as d3 from 'd3'
import {global, iconName,POIColorArray} from "../constants/constant";
import axios from 'axios'

class DetailView extends Component {
    constructor(props) {
        super(props);
        this.glyph = React.createRef()
    }

    componentDidMount() {
        this.draw(0)
        this.draw(1)
        this.draw(2)
    }

    draw=(index)=>{
        let width =280;
        let height = 300;
        let svg = d3.select(this.glyph.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        let arcCircle = d3.arc()
            .innerRadius(0)
            .outerRadius(height / 10)
            .startAngle(Math.PI / 2)
            .endAngle(Math.PI * 2);
        let arcCircleFactory = d3.arc()
            .innerRadius(0)
            .outerRadius(height / 10)
            .startAngle(function (d) {
                return Math.PI / 10 * d
            })
            .endAngle(function (d) {
                return Math.PI / 10 * (d + 1)
            });
        let arcFactory = d3.arc()
            .innerRadius(height / 10)
            .outerRadius(d=>height / 10+d-Math.random()*20+Math.random()*10)
            .startAngle(function (d,i) {
                return Math.PI / 12 * i + Math.PI / 2
            })
            .endAngle(function (d,i) {
                return Math.PI / 12 * (i + 1)+ Math.PI / 2
            });
        let d1 = [];
        let d2 = [];
        for(let i=0;i<24;i++){
            d1.push(Math.random()*30+5);
            d2.push(Math.random()*50+5);
        }
        // console.log("d1",d1);
        let g =svg.selectAll("g")
            .data(d1).enter()
            .append("path")
            .attr("class", "arc")
            .attr("fill",()=>'#3399ff')
            .attr("stroke","LightGrey")
            .attr("d", arcFactory)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        let g1 =svg.selectAll("g")
            .data(d2).enter()
            .append("path")
            .attr("class", "arc")
            .attr("fill",()=>'#623fa3')
            .attr("stroke","LightGrey")
            .attr("d", arcFactory)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        svg.append("circle")
            .attr("stroke","LightGrey")
            .attr("fill",d3.schemeSet1[1])
            .attr("r",height/10)
            .attr("cx",width/2)
            .attr("cy",height/2)
        svg.append("circle")
            .attr("stroke","LightGrey")
            .attr("fill","none")
            .attr("r",85)
            .attr("cx",width/2)
            .attr("cy",height/2)
        svg.append("circle")
            .attr("stroke","LightGrey")
            .attr("fill","none")
            .attr("r",120)
            .attr("cx",width/2)
            .attr("cy",height/2)
        svg.append("rect")
            .attr('width',width)
            .attr('height',height-10)
            .attr("fill","none")
            .attr("stroke","black")
        for(let i = 0;i<9;i++){
            let poir = 105;
            let cx = width/2;
            let cy = height/2;
            let p1 = svg.append("g")
            let poiCircle = p1.append("circle")
                .attr("r",10)
                .attr("cx",cx + poir * Math.sin(2*Math.PI/9*(i+2)+Math.PI/15))
                .attr('cy',cy+ poir * Math.cos(2*Math.PI/9*(i+2)+Math.PI/15))
                .attr('fill',POIColorArray[i]);
        }

    };
    componentWillUpdate(prevProps){
        if(prevProps.getDetailViewMessage!==this.props.getDetailViewMessage){
            Promise.all([
                axios.get(global.server + '/vis1/detailViewNum')
            ]).then(([data])=>{

            })

        }
    }

    render() {
        return (
            <div style={{overflowX:"auto" ,whiteSpace:"nowrap"}} ref={this.glyph}></div>
        )
    }
}

export default DetailView