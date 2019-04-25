import React, {Component} from 'react'
import * as d3 from 'd3'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Rc0 from './deprecate/Rc0'
import Rc1 from './deprecate/Rc1'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';




class RowChart extends Component{
   constructor(props){
       super(props);
   }

   componentDidMount(){

   }

   render(){
       let styles = theme => ({
           root: {
               width: '100%',
               marginTop: theme.spacing.unit * 3,
               overflowX: 'auto',
           },
           table: {
               minWidth: 700,
           },
       });
       let id = 0;
       function createData(name, calories, fat, carbs, protein) {
           id += 1;
           return { id, name, calories, fat, carbs, protein };
       }

       const rows = [
           createData( <FontAwesomeIcon icon="palette" size="xs"        color="rgb(23,118,182)"/>, 159, 6.0, 24, 4.0),
           createData( <FontAwesomeIcon icon="university" size="xs"     color="rgb(255,127,0)"/>, 159, 6.0, 24, 4.0),
           createData( <FontAwesomeIcon icon="utensils" size="xs"       color="rgb(36,161,33)"/>, 159, 6.0, 24, 4.0),
           createData( <FontAwesomeIcon icon="map-marked-alt" size="xs" color="rgb(216,36,31)"/>, 159, 6.0, 24, 4.0),
           createData( <FontAwesomeIcon icon="moon" size="xs"           color="rgb(149,100,191)"/>, 159, 6.0, 24, 4.0),
           createData( <FontAwesomeIcon icon="home" size="xs"          color="rgb(141,86,73)"/>, 159, 6.0, 24, 4.0),
           createData( <FontAwesomeIcon icon="football-ball" size="xs"   color="rgb(229,116,195)"/>, 159, 6.0, 24, 4.0),
           createData( <FontAwesomeIcon icon="shopping-cart" size="xs"  color="rgb(188,191,0)"/>, 159, 6.0, 24, 4.0),
           createData(  <FontAwesomeIcon icon="route" size="xs"         color="rgb(0,190,208)"/>, 159, 6.0, 24, 4.0),
       ];










       return(
           <div >
               <Paper className={styles.root}>
                   <Table className={styles.table}>
                       <TableHead>
                           <TableRow>
                               <TableCell>Category</TableCell>
                               <TableCell align="right">1</TableCell>
                               <TableCell align="right">2</TableCell>
                               <TableCell align="right">3</TableCell>
                               <TableCell align="right">4</TableCell>
                               <TableCell align="right">5</TableCell>
                           </TableRow>
                       </TableHead>
                       <TableBody>
                           {rows.map(row => (
                               <TableRow key={row.id}>
                                   <TableCell component="th" scope="row">
                                       {row.name}
                                   </TableCell>
                                   <TableCell align="right">{row.calories}</TableCell>
                                   <TableCell align="right">{row.fat}</TableCell>
                                   <TableCell align="right">{row.carbs}</TableCell>
                                   <TableCell align="right">{row.protein}</TableCell>
                                   <TableCell align="right">{row.protein}</TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                   </Table>
               </Paper>
           </div>
       )
   }
}

export default RowChart;
