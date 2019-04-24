import React, { Component } from 'react';
import './App.css';
import MapContainer from './component/MapContainer'

class App extends Component {
  constructor(){
    super();
  }
  render() {
    return (
        <div>
            <MapContainer/>
        </div>
    );
  }
}

export default App;
