import React,{Component} from 'react'
//react-bootstrap
import Card from "react-bootstrap/Card"
//react-leaflet
import {Map,
    TileLayer} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const center=[30.27, 120.2];
class MapHistory extends Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            <Card style={{float: "left", width: '23.8rem', height: '167px'}}>
                <Map center={center}zoom={11} style={{height: 168, width: '23.8rem'}} zoomControl={false} attributionControl={false}>
                    <TileLayer
                        url='https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ'
                    />
                </Map>
            </Card>
        )
    }

}

export default MapHistory;