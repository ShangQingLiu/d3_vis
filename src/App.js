import React, { Component } from 'react';
import './App.css';
import MapContainer from './component/MapContainer'
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesome} from '@fortawesome/react-fontawesome'
import {faPalette,faUniversity,faUtensils,faMapMarkedAlt,faMoon,faHome,faFootballBall,
faShoppingCart,faRoute} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

library.add(faPalette,faUniversity,faUtensils,faMapMarkedAlt,faMoon,faHome,faFootballBall,faShoppingCart,faRoute);
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
