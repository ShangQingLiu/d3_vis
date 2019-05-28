import React,{Component} from 'react'
import * as L from 'leaflet'
import 'iso8601-js-period/iso8601'
import 'leaflet-timedimension/dist/leaflet.timedimension.src'

class TrafficFlowHeatMap extends Component{

    componentDidMount(){
        let trafficFlowHeatMap = L.map(mapId, {
            zoomControl: false,
            attributeControl: false
        }).setView([30.27, 120.2], 8);
        L.tileLayer('https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ', {
            // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        }).addTo(trafficFlowHeatMap);
    }

    render(){
        return(
            <div id={"TrafficFlowHeatMap"}></div>
        )
    }
}

export default TrafficFlowHeatMap;
