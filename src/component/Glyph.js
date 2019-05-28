import React, {Component} from 'react'
import * as d3 from 'd3'
import {iconName} from "../constants/constant";

class Glyph extends Component {
    constructor(props) {
        super(props)
        this.glyph = React.createRef()
    }

    componentDidMount() {
        let width = 558;
        let height = 310;
        let svg = d3.select(this.glyph.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
        let arcCircle = d3.arc()
            .innerRadius(0)
            .outerRadius(height / 10)
            .startAngle(Math.PI / 2)
            .endAngle(Math.PI * 2)
        let arcCircleFactory = d3.arc()
            .innerRadius(0)
            .outerRadius(height / 10)
            .startAngle(function (d) {
                return Math.PI / 10 * d
            })
            .endAngle(function (d) {
                return Math.PI / 10 * (d + 1)
            });
        let l = [0, 1, 2, 3, 4]
        let innerCircle2 = svg.selectAll("g")
            .data(l).enter()
            .append("path")
            .attr("class", "innerCircle")
            .attr("fill", d => d3.schemeCategory10[d])
            .attr("stroke", d => d3.schemeCategory10[d])
            .attr("d", arcCircleFactory)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        let innerCircle1 = svg.append("g")
            .append("path")
            .attr("class", "innerCircle")
            .attr("fill", "LightGrey")
            .attr("stroke", "LightGrey")
            .attr("d", arcCircle)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        let arcFactory = d3.arc()
            .innerRadius(height / 10)
            .outerRadius(d=>height / 10+d)
            .startAngle(function (d,i) {
                return Math.PI / 12 * i + Math.PI / 2
            })
            .endAngle(function (d,i) {
                return Math.PI / 12 * (i + 1)+ Math.PI / 2
            });
        let d1 = [];
        let d2 = [];
        for(let i=0;i<18;i++){
           d1.push(Math.random()*30+5);
            d2.push(Math.random()*50+5);
        }
        // console.log("d1",d1);
        let g =svg.selectAll("g")
            .data(d1).enter()
            .append("path")
            .attr("class", "arc")
            .attr("fill",()=>'#e6e6fa')
            .attr("stroke","LightGrey")
            .attr("opacity",0.8)
            .attr("d", arcFactory)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        let g1 =svg.selectAll("g")
            .data(d2).enter()
            .append("path")
            .attr("class", "arc")
            .attr("opacity",0.8)
            .attr("fill",()=>'#f0f8ff')
            .attr("stroke","LightGrey")
            .attr("d", arcFactory)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        // for (let i = 0; i < 1; i++) {
        //     let d1 = Math.random() * 20;
        //     let d2 = Math.random() * 20;
        //     if(d1>d2){
        //         let arc2 =svg.selectAll("g")
        //             .append("path")
        //             .data(d2)
        //             .attr("class", "arc")
        //             .attr("fill",'#4284f5' )
        //             .attr("stroke","LightGrey")
        //             .attr("d", arcFactory)
        //             .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        //     }
        //     else{
        //         let arc2 =svg.selectAll("g")
        //             .append("path")
        //             .data(d2)
        //             .attr("class", "arc")
        //             .attr("fill",'#4284f5' )
        //             .attr("stroke","LightGrey")
        //             .attr("d", arcFactory)
        //             .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        //         let arc1 =svg.selectAll("g")
        //             .append("path")
        //             .data(d1)
        //             .attr("class", "arc")
        //             .attr("fill",'#5732a8' )
        //             .attr("stroke","LightGrey")
        //             .attr("d", arcFactory)
        //             .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        //     }
        // }

        svg.append("circle")
            .attr("stroke","LightGrey")
            .attr("fill","none")
            .attr("r",height/3)
            .attr("cx",width/2)
            .attr("cy",height/2)
        svg.append("circle")
            .attr("stroke","LightGrey")
            .attr("fill","none")
            .attr("r",height/2)
            .attr("cx",width/2)
            .attr("cy",height/2)
        for(let i = 0;i<9;i++){
            let poir = 130;
            let cx = width/2-20;
            let cy = height/2-20;
            let p1 = svg.append("g")
                .attr("width",50)
                .attr("height",50)
                .attr("transform","translate("+(cx + poir * Math.sin(2*Math.PI/9*(i+2)+Math.PI/15))+","+(cy+ poir * Math.cos(2*Math.PI/9*(i+2)+Math.PI/15))+")");
            // console.log("transform","translate("+(width/2 + poir * Math.sin(2*Math.PI/9*i))+","+(cy+ poir * Math.cos(2*Math.PI/9*i))+")")
            // console.log(width/2+poir * Math.sin(0))

            d3.xml(iconName[i]).then((data)=>{
                p1.node().append(data.documentElement)
            })
        }
        // for(let j=0;j<1;j++){
        //     console.log(global.poimap[j])
        //     svg
        //         .append("foreignObject")
        //         .attr("width", width)
        //         .attr("height", height)
        //         .append("xhtml:body")
        //         .attr("width",40)
        //         .attr('height',40)
        //         .append("embed")
        //         .attr("src","art-en.svg")
        //         .attr("width",40)
        //         .attr('height',40)
        //         .attr("transform",'translate('+105+","+105+")" )
        // }

    }

    render() {
        return (
            <div ref={this.glyph}></div>
        )
    }
}

export default Glyph