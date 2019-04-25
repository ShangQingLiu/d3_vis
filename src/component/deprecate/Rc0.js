import React, {Component} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import * as d3 from 'd3'
class Rc0 extends Component{
    constructor(){
        super()
        this.rc0 = React.createRef();
    }

    componentDidMount(){
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
            .size(function(d) { return d.size; });

        var xAxis = d3.axisTop(x)

        ////////////////////////////////////////
        //rc0
        var svg = d3.select(this.rc0.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height)
            .on("click", up);

        svg.append("g")
            .attr("class", "x axis");

        svg.append("g")
            .attr("class", "y axis")
            .append("line")
            .attr("y1", "100%");

        Promise.all(
            [d3.json("./POI0.json")]
        ).then(([root])=>{
            console.log(root);
            var hierarchy = d3.hierarchy(root);
            partition(hierarchy)
                .sum(d=>d.size)
                .sort(function(a,b){return a.size-b.size})
                .descendants();
            x.domain([0, hierarchy.value]).nice();
            down(hierarchy, 0);
        });
////////////////////////////////////////////////////////////////////
        function down(d, i) {
            // console.log("down")
            if (!d.children ) return;
            var end = duration + d.children.length * delay;

            // Mark any currently-displayed bars as exiting.
            var exit = svg.selectAll(".enter")
                .attr("class", "exit");

            // Entering nodes immediately obscure the clicked-on bar, so hide it.
            exit.selectAll("rect").filter(function(p) { return p === d; })
                .style("fill-opacity", 1e-6);

            // Enter the new bars for the clicked-on data.
            // Per above, entering bars are immediately visible.
            var enter = bar(d)
                .attr("transform", stack(i))
                .style("opacity", 1);

            // Have the text fade-in, even though the bars are visible.
            // Color the bars as parents; they will fade to children if appropriate.
            // console.log("enter",enter);
            enter.selectAll("text").style("fill-opacity", 1e-6);
            enter.select("rect").style("fill", function (d,i) {
                if(i>=7){
                    i++
                }
                return d3.schemeCategory10[i]
            });

            // Update the x-scale domain.
            x.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice();

            // Update the x-axis.
            svg.selectAll(".x.axis").transition()
                .duration(duration)
                .call(xAxis);

            // Transition entering bars to their new position.
            var enterTransition = enter.transition()
                .duration(duration)
                .delay(function(d, i) { return i * delay; })
                .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; });

            // Transition entering text.
            enterTransition.select(".y.axis").selectAll("text")
                .style("fill-opacity", 1);

            // Transition entering rects to the new x-scale.
            enterTransition.select("rect")
                .attr("width", function(d) { return x(d.value); })
                .style("fill", function(d ,i) { if(i>=7){
                    i++;
                } return d3.schemeCategory10[i]; });

            // Transition exiting bars to fade out.
            var exitTransition = exit.transition()
                .duration(duration)
                .style("opacity", 1e-6)
                .remove();

            // Transition exiting bars to the new x-scale.
            exitTransition.selectAll("rect")
                .attr("width", function(d) { return x(d.value); });

            // Rebind the current node to the background.
            svg.select(".background")
                .datum(d)
                .transition()
                .duration(end);

            d.index = i;
        }

        function up(d) {
            // console.log(up);
            if (!d.parent) return;
            var end = duration + d.children.length * delay;

            // Mark any currently-displayed bars as exiting.
            var exit = svg.selectAll(".enter")
                .attr("class", "exit");

            // Enter the new bars for the clicked-on data's parent.
            var enter = bar(d.parent)
                .attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; })
                .style("opacity", 1e-6);

            // Color the bars as appropriate.
            // Exiting nodes will obscure the parent bar, so hide it.
            enter.select("rect")
                .style("fill", function(d) { return color(!!d.children); })
                .filter(function(p) { return p === d; })
                .style("fill-opacity", 1e-6);

            // Update the x-scale domain.
            x.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

            // Update the x-axis.
            svg.selectAll(".x.axis").transition()
                .duration(duration)
                .call(xAxis);

            // Transition entering bars to fade in over the full duration.
            var enterTransition = enter.transition()
                .duration(end)
                .style("opacity", 1);

            // Transition entering rects to the new x-scale.
            // When the entering parent rect is done, make it visible!
            enterTransition.select("rect")
                .attr("width", function(d) { return x(d.value); })
                .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

            // Transition exiting bars to the parent's position.
            var exitTransition = exit.selectAll("g").transition()
                .duration(duration)
                .delay(function(d, i) { return i * delay; })
                .attr("transform", stack(d.index));

            // Transition exiting text to fade out.
            exitTransition.select("text")
                .style("fill-opacity", 1e-6);

            // Transition exiting rects to the new scale and fade to parent color.
            exitTransition.select("rect")
                .attr("width", function(d) { return x(d.value); })
                .style("fill", color(true));

            // Remove exiting nodes when the last child has finished transitioning.
            exit.transition()
                .duration(end)
                .remove();

            // Rebind the current parent to the background.
            svg.select(".background")
                .datum(d.parent)
                .transition()
                .duration(end);
        }

// Creates a set of bars for the given data node, at the specified index.
        function bar(d) {
            // console.log("bar")
            var bar = svg.insert("g", ".y.axis")
                .attr("class", "enter")
                .attr("transform", "translate(0,5)")
                .selectAll("g")
                .data(d.children)
                .enter().append("g")
                .style("cursor", function(d) { return !d.children ? null : "pointer"; })
                .on("click", down);
            bar.append("rect")
                .attr("width", function(d) { return x(d.value); })
                .attr("height", barHeight);

            // var text = svg.select(".y.axis").selectAll("text")
            //     .data(d.children)
            // //update if needed
            //     text.attr("class","update")
            //     .enter()
            //     .append("text")
            //     .attr("class","enter")
            //     .attr("x", 20)
            //     .attr("y", function (d,i) {
            //       return (i)*(barHeight+4.4) + 20 ;
            //     })
            //         .merge(text)
            //     // .attr("dy", ".35em")
            //     // .style("text-anchor", "end")
            //     .style("fill","black")
            //         .attr('class', 'fas fa-user')
            //     .attr('font-size', function(d) { return 1+'em'} )
            //         .text(function (d) { return "\uf2b9"});
            // text.exit().remove();


            return bar;
        }

// A stateful closure for stacking bars horizontally.
        function stack(i) {
            var x0 = 0;
            return function(d) {
                var tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
                x0 += x(d.value);
                return tx;
            };
        }
    }
    render(){
        return(
            <svg id="rc0" ref={this.rc0} width="500px" height="400px" style={{fill:"none"}}>
                <FontAwesomeIcon icon="palette" size="xs" transform="shrink-15 left-17 up-5.8"         color="rgb(23,118,182)"/>
                <FontAwesomeIcon icon="university" size="xs"     transform="shrink-15 left-17 up-4.2"      color="rgb(255,127,0)"/>
                <FontAwesomeIcon icon="utensils" size="xs"       transform="shrink-15 left-17 up-2.6"        color="rgb(36,161,33)"/>
                <FontAwesomeIcon icon="map-marked-alt" size="xs" transform="shrink-15 left-17 up-1.0"  color="rgb(216,36,31)"/>
                <FontAwesomeIcon icon="moon" size="xs"           transform="shrink-15 left-17 down-0.6"          color="rgb(149,100,191)"/>
                <FontAwesomeIcon icon="home" size="xs"           transform="shrink-15 left-17 down-2.1"          color="rgb(141,86,73)"/>
                <FontAwesomeIcon icon="football-ball" size="xs"  transform="shrink-15 left-17 down-3.7" color="rgb(229,116,195)"/>
               <FontAwesomeIcon icon="shopping-cart" size="xs"  transform="shrink-15 left-17 down-5.2" color="rgb(188,191,0)"/>
                <FontAwesomeIcon icon="route" size="xs"          transform="shrink-15 left-17 down-6.7"         color="rgb(0,190,208)"/>
            </svg>
            )
    }
}

export default Rc0
