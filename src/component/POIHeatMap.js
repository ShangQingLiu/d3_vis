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
import axios from 'axios';
import * as coordTransform from 'coordtransform';
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
            markers:[],
            showPath:false,
            testData:[],
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
                // console.log(data);
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
                // console.log(data);
                this.setState({
                    heatmapdata: data["data"]["data"],
                    height:"630px"
                })
            });
            this.timerStart();
        }
    };

    nextFrame = () =>{
        // console.log("timer");
        // console.log(period);
        period = period+6;

        let params = {
            mode:this.props.mode,
            period:period
        };
        Promise.all(
            [axios.get(global.server + '/vis1/poiHeatMap', {params})]
        ).then(([data])=>{
            // console.log(data);
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
        this.test();
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
                // console.log(data)
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
    getPathData = ()=>{
        if(this.timer){
            this.setState({
               showPath:true
            });
            clearTimeout(this.timer);
        }
        else{
            this.timer = setTimeout(()=>{
                this.props.poiheatmap2circular();
                this.getPathData();
            },5000)
        }
    };
    clickMap = (e)=>{
        if(this.props.setStartDestination){
            if(global.markers.length<2){
                if(global.markers.length===1){
                   this.props.poiheatmap2circular();
                   this.timerEnd();
                   //get Route
                    this.getPathData();
                }
                global.markers.push(e.latlng);
                this.setState({
                    markers:global.markers
                })

            }
        }
    };
    test = ()=>{
        const pathData =[[30.269596,120.124565],[30.26964,120.12458],[30.26967,120.12458],[30.270515,120.123131],[30.270515,120.123131],[30.271927,120.124275],[30.272127,120.12439],[30.272144,120.12114],[30.27224,120.12114],[30.272253,120.120239],[30.272253,120.120239],[30.293737,120.11866],[30.293989,120.118515],[30.293646,120.110107],[30.293646,120.110107],[30.293612,120.107239],[30.293612,120.107239],[30.294964,120.092781],[30.294964,120.092781],[30.304892,120.092453],[30.304974,120.092377],[30.304558,120.086365],[30.304558,120.086365],[30.303799,120.086479]];
        const data = [[30.268914,120.127537],[30.268764,120.127957],[30.268693,120.128157],[30.268643,120.128348],[30.268603,120.128438],[30.26823,120.129558],[30.268099,120.129988],[30.268048,120.130149],[30.267826,120.130729],[30.268035,120.130809],[30.267873,120.13126],[30.267694,120.131209],[30.267583,120.1314],[30.267592,120.13143],[30.267542,120.13158],[30.267592,120.13162],[30.267661,120.13168],[30.267701,120.13171],[30.267821,120.13175],[30.267951,120.13172],[30.26788,120.13188],[30.26785,120.13196],[30.267717,120.132451],[30.267697,120.132521],[30.267697,120.132521],[30.268286,120.132712],[30.268824,120.132952],[30.269263,120.133143],[30.270101,120.133504],[30.27046,120.133654],[30.271088,120.133925],[30.271397,120.134055],[30.271516,120.134105],[30.271586,120.134135],[30.271885,120.134266],[30.272025,120.134326],[30.272643,120.134586],[30.272792,120.134647],[30.273301,120.134857],[30.2734,120.134897],[30.27347,120.134937],[30.273709,120.135037],[30.273879,120.135098],[30.274397,120.135318],[30.275125,120.135609],[30.275901,120.13602],[30.2761,120.13613],[30.276956,120.136501],[30.277634,120.136782],[30.277634,120.136782],[30.277733,120.136822],[30.277863,120.136862],[30.277943,120.136872],[30.278083,120.136882],[30.278083,120.136882],[30.279094,120.136771],[30.279164,120.136771],[30.279714,120.136731],[30.280435,120.136671],[30.280755,120.136651],[30.280955,120.136631],[30.281345,120.13659],[30.281696,120.13657],[30.281976,120.13654],[30.282306,120.13651],[30.283187,120.136409],[30.283567,120.136369],[30.284228,120.136299],[30.284959,120.136218],[30.285469,120.136168],[30.285679,120.136148],[30.285989,120.136128],[30.286249,120.136117],[30.28721,120.136047],[30.28783,120.135996],[30.289031,120.135905],[30.289761,120.135855],[30.290151,120.135824],[30.290431,120.135804],[30.290802,120.135774],[30.290902,120.135764],[30.291732,120.135703],[30.291892,120.135693],[30.292432,120.135652],[30.292973,120.135602],[30.293853,120.135541],[30.294233,120.135511],[30.294323,120.135501],[30.294453,120.1355],[30.294682,120.135601],[30.294752,120.13562],[30.294942,120.13563],[30.296233,120.135519],[30.296803,120.135498],[30.297143,120.135438],[30.297213,120.135418],[30.297333,120.135408],[30.297724,120.135307],[30.298165,120.135257],[30.298215,120.135247],[30.298785,120.135206],[30.299185,120.135186],[30.299605,120.135155],[30.300135,120.135135],[30.300325,120.135144],[30.300425,120.135164],[30.300545,120.135184],[30.300794,120.135224],[30.300794,120.135224],[30.300914,120.135204],[30.300914,120.135204],[30.300925,120.135094],[30.300936,120.134973],[30.300942,120.134252],[30.300933,120.134132],[30.300923,120.134072],[30.300905,120.133781],[30.300859,120.13326],[30.300811,120.13298],[30.300756,120.132119],[30.300789,120.131418],[30.300873,120.130587],[30.300956,120.129776],[30.300968,120.129105],[30.30084,120.128025],[30.300791,120.127875],[30.300721,120.127565],[30.300642,120.127155],[30.300452,120.126045],[30.300301,120.125145],[30.300281,120.124935],[30.300209,120.124176],[30.300199,120.124006],[30.300147,120.123366],[30.300126,120.123087],[30.300104,120.122397],[30.300111,120.121678],[30.300099,120.121378],[30.300099,120.121259],[30.300086,120.120709],[30.300071,120.119851],[30.30007,120.119701],[30.299997,120.117974],[30.299986,120.117785],[30.299968,120.116887],[30.299943,120.116408],[30.299913,120.11539],[30.299899,120.114931],[30.299876,120.113825],[30.299871,120.113406],[30.299857,120.113037],[30.299847,120.112279],[30.299846,120.111402],[30.299878,120.110804],[30.299977,120.110067],[30.300168,120.109419],[30.300492,120.108363],[30.300718,120.107486],[30.300851,120.107018],[30.300943,120.106569],[30.300997,120.106201],[30.301037,120.105573],[30.301101,120.104667],[30.301097,120.104448],[30.301097,120.104408],[30.301104,120.104249],[30.301091,120.103482],[30.301016,120.101581],[30.301015,120.101521],[30.301013,120.101402],[30.301,120.100685],[30.300998,120.100586],[30.301003,120.100327],[30.30101,120.100128],[30.301033,120.099262],[30.301033,120.099262],[30.301433,120.099242],[30.301892,120.099221],[30.302462,120.099191],[30.302721,120.099181],[30.303081,120.09916],[30.303161,120.09916],[30.30357,120.09914],[30.30407,120.09911],[30.30429,120.099099],[30.304988,120.099049],[30.305288,120.099019],[30.306127,120.098968],[30.306216,120.098958],[30.306986,120.098957],[30.307886,120.098956],[30.309415,120.098935],[30.309795,120.098935],[30.310195,120.098924],[30.310515,120.098924],[30.310895,120.098924],[30.311025,120.098923],[30.311025,120.098923],[30.311023,120.098834],[30.311001,120.098704],[30.311026,120.098476],[30.311025,120.097898],[30.311025,120.097898],[30.311166,120.097918],[30.311252,120.097749],[30.31126,120.097599],[30.311115,120.096813],[30.31099,120.096017],[30.310866,120.095311],[30.310855,120.095261],[30.310809,120.094913],[30.31076,120.094445],[30.310737,120.094306],[30.310648,120.093808],[30.310601,120.09344],[30.310544,120.093042]];
        let tmpAr1 = [];
        let tmpAr = [];
       for(let i = 0; i<pathData.length;i++){
           tmpAr1.push(coordTransform.bd09togcj02(pathData[i][0],pathData[i][1]));
       }
        for(let i = 0; i<tmpAr1.length;i++){
            tmpAr.push(coordTransform.gcj02towgs84(tmpAr1[i][0],tmpAr1[i][1]));
        }
       console.log("tmpAr",tmpAr);
       this.setState({
          testData:pathData
       })
    };
    render(){
        const pathData =[[30.269596,120.124565],[30.26964,120.12458],[30.26967,120.12458],[30.270515,120.123131],[30.270515,120.123131],[30.271927,120.124275],[30.272127,120.12439],[30.272144,120.12114],[30.27224,120.12114],[30.272253,120.120239],[30.272253,120.120239],[30.293737,120.11866],[30.293989,120.118515],[30.293646,120.110107],[30.293646,120.110107],[30.293612,120.107239],[30.293612,120.107239],[30.294964,120.092781],[30.294964,120.092781],[30.304892,120.092453],[30.304974,120.092377],[30.304558,120.086365],[30.304558,120.086365],[30.303799,120.086479]];
        const startPoint = [30.269600,120.124559];//玉泉北门
        const endPoint = [30.303638,120.086634];//紫金港
        const Markers = this.state.markers.map((value)=>
            <Marker position={value}>
            </Marker>
        );
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
            <Map center={center} zoom={11} style={{width:"68rem"}} onClick={this.clickMap} >
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

                {Markers}
                {/*<Marker position={startPoint}>*/}
                    {/*<Popup>*/}
                        {/*Start Point*/}
                    {/*</Popup>*/}
                {/*</Marker>*/}
                {/*<Marker position={endPoint}>*/}
                    {/*<Popup>*/}
                       {/*Destination*/}
                    {/*</Popup>*/}
                {/*</Marker>*/} {this.state.showPath &&<AntPath positions={this.state.testData} option={antPathOptions}/> }
            </Map>
        )
    }
}
export default POIHeatMap