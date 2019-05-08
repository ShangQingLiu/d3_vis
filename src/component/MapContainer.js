import React, {Component} from 'react';
import L from 'leaflet';
import WorldMap from "./WorldMap";
import {global} from "../constants/constant";
import Card from "react-bootstrap/Card"
import MultiLineChart from "../component/MultiLineChart"
import RowChart from "../component/RowChart"
import '../css/MapContainer.css'

class MapContainer extends Component {
    constructor() {
        super();
        this.state = {
            drawCircleOn: false,
            drawPolyOn: false,
            drawRectOn: false,
            drawRectComplete: false,
            redraw: false,
            poiShow: false,
        };
    }

    onRef = (ref) => {
        this.child = ref;
    };
    handleDrawCircle = () => {
        if (global.map.listens('mousedown')) {
            global.map.off('mousedown');
            global.map.off('mouseup');
            global.map.off('mousemove');
            global.map.dragging.enable();
        }
        else {
            let r = 0;
            let i = null;
            let tempCircle = new L.circle();

            function onmouseDown(e) {
                i = e.latlng
                //确定圆心
            }

            function onMove(e) {
                if (i) {
                    r = L.latLng(e.latlng).distanceTo(i);
                    tempCircle.setLatLng(i);
                    tempCircle.setRadius(r);
                    tempCircle.setStyle({color: '#ff0000', fillColor: '#ff0000', fill: false});
                    global.map.addLayer(tempCircle)

                }
            }

            function onmouseUp(e) {
                r = L.latLng(e.latlng).distanceTo(i)//计算半径
                L.circle(i, {radius: r, color: '#ff0000', fillColor: '#ff0000', fill: false}).addTo(global.map);
                i = null;
                r = 0
            }

            global.map.on('mousedown', onmouseDown);
            global.map.on('mouseup', onmouseUp);
            global.map.on('mousemove', onMove);
            global.map.dragging.disable();
        }
        this.setState(state => ({
            drawCircleOn: !state.drawCircleOn
        }));
    };
    handleDrawPoly = () => {
        if (global.map.listens('dblclick')) {
            global.map.off('click');    //点击地图
            global.map.off('dblclick');
            global.map.off('mousemove')//双击地图
            global.map.dragging.enable();
        }
        else {

            global.map.dragging.disable();
            let points = [];
            let lines = new L.polyline([]);
            let tempLines = new L.polyline([], {dashArray: 5});
            global.map.on('click', onClick);    //点击地图
            global.map.on('dblclick', onDoubleClick);
            global.map.on('mousemove', onMove)//双击地图


            function onClick(e) {
                points.push([e.latlng.lat, e.latlng.lng]);
                lines.addLatLng(e.latlng);
                global.map.addLayer(tempLines);
                global.map.addLayer(lines);
                global.map.addLayer(L.circle(e.latlng, {color: '#ff0000', fillColor: 'ff0000', fillOpacity: 1}))

            }

            function onMove(e) {
                if (points.length > 0) {
                    let ls = [points[points.length - 1], [e.latlng.lat, e.latlng.lng], points[0]];
                    tempLines.setLatLngs(ls)
                    // map.addLayer(tempLines)
                }
            }

            function onDoubleClick(e) {
                L.polygon(points).addTo(global.map);
                points = [];
                //map.removeLayer(tempLines)
                //tempLines.remove()
                lines.remove();
                tempLines.remove();
                lines = new L.polyline([]);
            }
        }
        this.setState(state => ({
            drawPolyOn: !state.drawPolyOn
        }));
    };
    handleDrawRec = () => {
        if (global.map.listens('mousedown')) {
            global.map.off('mousedown');    //点击地图
            global.map.off('mouseup');
            global.map.dragging.enable();
        }
        else {
            global.map.dragging.disable();
            let rectangle;
            let tmprect;
            const latlngs = [];
            global.map.on('mousedown', mouseDown);    //点击地图
            global.map.on('mouseup', mouseUp.bind(this));

            //map.off(....) 关闭该事件
            function mouseDown(e) {
                if (typeof tmprect != 'undefined') {
                    tmprect.remove()
                }
                //左上角坐标
                latlngs[0] = [e.latlng.lat, e.latlng.lng]
                //开始绘制，监听鼠标移动事件
                global.map.on('mousemove', onMove)

            }

            function onMove(e) {
                latlngs[1] = [e.latlng.lat, e.latlng.lng]
                //删除临时矩形
                if (typeof tmprect !== 'undefined') {
                    tmprect.remove()
                }
                //添加临时矩形
                tmprect = L.rectangle(latlngs, {dashArray: 5}).addTo(global.map)
            }

            function mouseUp(e) {
                //矩形绘制完成，移除临时矩形，并停止监听鼠标移动事件
                tmprect.remove();
                global.map.off('mousemove');
                //右下角坐标
                latlngs[1] = [e.latlng.lat, e.latlng.lng];
                // var bounds = L.bounds(latlngs[0],latlngs[1]);
                rectangle = L.rectangle(latlngs, {
                    color: '#3300ff',
                    fillOpacity: 0,
                    weight: 2
                });
                global.selectGroup.push(rectangle);
                global.selectGroups = L.layerGroup(global.selectGroup);
                global.map.addLayer(global.selectGroups);
                this.setState(state => ({
                    redraw: !state.redraw
                }));
                //调整view范围
                // global.map.fitBounds(latlngs);
            }
        }
        this.setState(state => ({
            drawRectOn: !state.drawRectOn
        }));
    };
    handleCleanSelection = () => {
        global.selectGroups.clearLayers();
        global.selectGroup = [];
    };
    handlePOIClick = () => {
        this.setState(state => ({
            poiShow: !state.poiShow
        }))
    };

    UNSAFE_componentWillUpdate() {
    }

    render() {
        const poimap = ['art-en.svg', 'collage-university.svg', 'food.svg', 'nightlife.svg', 'outdoor.svg', 'professional.svg', 'residence.svg', 'shop.svg', 'travel.svg'];
        const listPoi = poimap.map((item) => <embed src={item} display="block" width="30px" height="30px"
                                                    key={item.toString()}></embed>)
        return (
            <div>
                <div style={{float: "left"}}>
                    <Card style={{width: '15.5rem', height: '44.8rem'}}>
                        <Card.Header as="h6">Data Overview</Card.Header>
                        <div className="sigma-content">
                            <div className="sigma-middle-line">
                                <span className="sigma-line-text">Data Set</span>
                            </div>
                        </div>
                        <div style={{marginBottom: "2px"}}>
                            <select className="browser-default selectClass">
                                <option value="1">Using HangZhou Taxi Trajectory</option>
                            </select>
                        </div>
                        <div align="middle">
                            <select className="browser-default selectClass">
                                <option value="1">Using HangZhou POIS</option>
                            </select>
                        </div>
                        <div className="sigma-content">
                            <div className="sigma-middle-line">
                                <span className="sigma-line-text">AOI Area</span>
                            </div>
                        </div>
                        <form id="Mycheckbox">
                            <div className="col s12">
                                <p>
                                    <label>
                                        <input id="checkTrafficFlow" type="checkbox" name="group0" className="filled-in"
                                               onClick={this.handlePOIClick}/>
                                        <span>select a single POI</span>
                                    </label>
                                </p>
                                {this.state.poiShow && listPoi}
                            </div>
                            <div className="col s12">
                                <p>
                                    <label>
                                        <input id="checkNMF" type="checkbox" name="group0" className="filled-in"
                                               onClick={this.handleDrawRec}/>
                                        <span>specify a rectangle area</span>
                                    </label>
                                </p>
                            </div>
                            <div className="col s12">
                                <p>
                                    <label>
                                        <input id="checkInterView" type="checkbox" name="group0" className="filled-in"
                                        />
                                        <span>select an administrative zone</span>
                                    </label>
                                </p>
                            </div>
                        </form>


                        {/*<Button varient="primary" size="sm" onClick={this.handleDrawCircle}>draw circle</Button>*/}
                        {/*<Button varient="primary" size="sm" onClick={this.handleDrawPoly}>draw polygon</Button>*/}
                        {/*<Button varient="primary" size="sm" onClick={this.handleDrawRec}>draw rectangle</Button>*/}
                        {/*<Button varient="primary" size="sm" onClick={this.handleCleanSelection}>clean selection</Button>*/}
                    </Card>
                </div>
                <div>
                    <Card style={{float: "left", width: '104rem', height: '720px', marginLeft: '1px'}}>
                        <Card.Header as="h6">Global Map View</Card.Header>
                        <div>
                            <WorldMap onRef={this.onRef} redraw={this.state.redraw}/>
                            <Card style={{float: "left", width: '9.8rem', height: '167px'}}>
                            </Card>
                            <Card style={{float: "left", width: '9.8rem', height: '167px'}}>
                            </Card>
                            <Card style={{float: "left", width: '9.8rem', height: '167px'}}>
                            </Card>
                            <Card style={{float: "left", width: '9.8rem', height: '167px'}}>
                            </Card>
                        </div>
                    </Card>
                </div>
                <div>
                    <Card style={{float: "left", width: '60rem', height: '350px'}}>
                        <Card.Header as="h6">POI Numbers Of Five Tensors</Card.Header>
                        <RowChart redraw={this.state.redraw}/>
                    </Card>
                    <Card style={{float: "left", width: '60rem', height: '350px'}}>
                        <Card.Header as="h6">24hr Traffic Flow</Card.Header>
                        <MultiLineChart redraw={this.state.redraw}/>
                    </Card>
                </div>

            </div>
        )
    }
}

export default MapContainer;
