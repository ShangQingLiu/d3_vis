import React, {Component} from 'react';
import L from 'leaflet';
import axios from 'axios';
import * as d3 from 'd3';
import {global} from "../constants/constant";
import 'leaflet-arc'
import {
    Map,
    TileLayer
} from 'react-leaflet'

const center=[30.27, 120.2];
class WorldMap extends Component {
    constructor(props) {
        super(props)
    }




    render() {
        return (
            <div style={{float:"left"}}>
            <Map center={center}zoom={11} >
                <TileLayer
                    attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                    url='https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ'
                />
                


            </Map>
            </div>
        )
    }
}

export default WorldMap;
