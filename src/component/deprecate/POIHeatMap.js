import React,{Component} from 'react'
import {Map,
    TileLayer} from 'react-leaflet'
import HeatmapLayer from 'react-leaflet-heatmap-layer/src/HeatmapLayer'

const center=[30.27, 120.2];


class POIHeatMap extends Component{

    constructor(props){
        super(props);
        this.state={
            mapHidden: false,
            layerHidden: false,
            data:'',
            radius: 4,
            blur: 8,
            max: 0.5,
            limitAddressPoints: true,
        }
    }

    render(){
        const gradient = {
            0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
            0.6: '#FAF3A5', 0.8: '#F5D98B', 1.0: '#DE9A96'
        };
        return(
            <Map center={center}zoom={11} >
                <HeatmapLayer
                    fitBoundsOnLoad
                    fitBoundsOnUpdatae
                    points={this.state.data}
                    longitudeExtractor={m => m[1]}
                    latitudeExtractor={m => m[0]}
                    gradient={gradient}
                    intensityExtractor={m => parseFloat(m[2])}
                    radius={Number(this.state.radius)}
                    blur={Number(this.state.blur)}
                    max={Number.parseFloat(this.state.max)}
                >
                </HeatmapLayer>
                <TileLayer
                    attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                    url='https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ'
                />
            </Map>
        )
    }
}
export default POIHeatMap