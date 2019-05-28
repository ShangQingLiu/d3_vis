import React,{Component} from 'react'
import L from 'leaflet';
import {Map,
    TileLayer,
    Marker,
    Popup
} from 'react-leaflet'
import AntPath from "react-leaflet-ant-path"
import HeatmapLayer from 'react-leaflet-heatmap-layer'
import{global,POIMap} from "../constants/constant";
import axios from 'axios'

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
const center=[30.27, 120.2];
let timer = undefined;
let period = 3000;

class POIHeatMap extends Component{


    constructor(props){
        super(props);
        this.state={
            mapHidden: false,
            layerHidden: false,
            heatmapdata:[],
            radius: 4,
            blur: 8,
            max: 0.5,
            limitAddressPoints: true,
            gradient:{
                0.4: 'blue', 0.8: 'orange', 1.0: 'red'
                // 0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
                // 0.6: '#FAF3A5', 0.8: '#F5D98B', 1.0: '#DE9A96'
            },
            height:"670px",
        }
    }
    componentWillMount(){
        this.switchMode(this.props.mode);
    }

    switchMode = (newMode)=>{
        if(newMode=== "POI"){
            console.log("POI");
            this.timerEnd();
            let params = {
                mode:"POI",
                cate:POIMap[this.props.frompoichoosedialog].toString()
            };
            this.setState({
                radius: 4,
                blur: 8,
                gradient:{
                    0.4: 'blue', 0.8: 'orange', 1.0: 'red'
                },
            });
            Promise.all(
                [axios.get(global.server + '/vis1/poiHeatMap', {params})]
            ).then(([data])=>{
                console.log(data);
                this.setState({
                    heatmapdata: data["data"]["data"]
                })
            })
        }
        else if (newMode ==="Traffic Flow"){
            console.log("Traffic Flow");
            let params = {
                mode:this.props.mode,
                period:period
            };
            this.setState({
                radius: 3,
                blur: 0.1,
                gradient:{
                    0.1: '#FF0000',
                    1.0: '#FF0000',
                },
            });
            Promise.all(
                [axios.get(global.server + '/vis1/poiHeatMap', {params})]
            ).then(([data])=>{
                console.log(data);
                this.setState({
                    heatmapdata: data["data"]["data"],
                    height:"630px"
                })
            });
            this.timerStart();
        }
    };

    nextFrame = () =>{
        console.log("timer");
        console.log(period);
        period++;
        let params = {
            mode:this.props.mode,
            period:period
        };
        Promise.all(
            [axios.get(global.server + '/vis1/poiHeatMap', {params})]
        ).then(([data])=>{
            console.log(data);
            this.setState({
                heatmapdata: data["data"]["data"]
            })
        })
    };

    timerStart = () =>{
        timer = setInterval(()=>this.nextFrame(),600);
    };

    timerEnd = () =>{
      if(this.timer){
          clearTimeout(this.timer)
      }
    };

    componentDidMount(){
    }

    componentWillUpdate(nextProps){
        if(nextProps.frompoichoosedialog !== this.props.frompoichoosedialog){
            let params = {
                mode:"POI",
                cate:POIMap[parseInt(nextProps.frompoichoosedialog)].toString()
            };
            Promise.all(
                [axios.get(global.server + '/vis1/poiHeatMap', {params})]
            ).then(([data])=>{
                console.log(data)
                this.setState({
                    heatmapdata: data["data"]["data"]
                })
            })
        }
        if(nextProps.mode !== this.props.mode){
            console.log("switch");
            let newMode;
            if(this.props.mode === "POI"){
               newMode = "Traffic Flow"
            }
            else{
                newMode = "POI"
            }
           this.switchMode(newMode)
        }
    }
    render(){
        const pathData =[[30.269596,120.124565],[30.26964,120.12458],[30.26967,120.12458],[30.270515,120.123131],[30.270515,120.123131],[30.271927,120.124275],[30.272127,120.12439],[30.272144,120.12114],[30.27224,120.12114],[30.272253,120.120239],[30.272253,120.120239],[30.293737,120.11866],[30.293989,120.118515],[30.293646,120.110107],[30.293646,120.110107],[30.293612,120.107239],[30.293612,120.107239],[30.294964,120.092781],[30.294964,120.092781],[30.304892,120.092453],[30.304974,120.092377],[30.304558,120.086365],[30.304558,120.086365],[30.303799,120.086479]];
        const startPoint = [30.269600,120.124559]//玉泉北门
        const endPoint = [30.303638,120.086634]//紫金港
        const antPathOptions={
            "delay": 400,
            "dashArray": [
                10,
                20
            ],
            "weight": 5,
            "color": "#0000FF",
            "pulseColor": "#FFFFFF",
            "paused": false,
            "reverse": false,
            "hardwareAccelerated": true
        };
        return(
            <Map center={center}zoom={11}  >
                <HeatmapLayer
                    fitBoundsOnLoad
                    fitBoundsOnUpdatae
                    points={this.state.heatmapdata}
                    longitudeExtractor={m => m[1]}
                    latitudeExtractor={m => m[0]}
                    gradient={this.state.gradient}
                    intensityExtractor={m => parseFloat(m[2])}
                    radius={Number(this.state.radius)}
                    blur={Number(this.state.blur)}
                    max={Number.parseFloat(this.state.max)}
                >
                </HeatmapLayer>
                <TileLayer
                    // attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                    url='https://api.mapbox.com/styles/v1/osmallfrogo/cjumipd087qvo1ftqrkq7hcxb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoib3NtYWxsZnJvZ28iLCJhIjoiY2p0em5pNnZ3MzZjMTRlbXVyOTNyYjJ5aiJ9.rUrqX8nYoZXe0mxMowBLyQ'
                />

                {/*<Marker position={startPoint}>*/}
                    {/*<Popup>*/}
                        {/*Start Point*/}
                    {/*</Popup>*/}
                {/*</Marker>*/}
                {/*<Marker position={endPoint}>*/}
                    {/*<Popup>*/}
                       {/*Destination*/}
                    {/*</Popup>*/}
                {/*</Marker>*/}
                {/*<AntPath positions={pathData} option={antPathOptions}/>*/}
            </Map>
        )
    }
}
export default POIHeatMap