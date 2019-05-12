import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {iconName,POIMap} from "../constants/constant";

const options = [
    'None',
    'Atria',
    'Callisto',
    'Dione',
    'Ganymede',
    'Hangouts Call',
    'Luna',
    'Oberon',
    'Phobos',
    'Pyxis',
    'Sedna',
    'Titania',
    'Triton',
    'Umbriel',
];

class POIChooseDialogRaw extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            selectedValue: '0',
        };
    }

    // TODO
    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value });
        }
    }

    handleCancel = () => {
        this.props.onClose();
    };

    handleOk = () => {
        this.props.onClose();
        this.props.toPOIHeatMap(this.state.selectedValue)
    };

    handleChange = (event, value) => {
        this.setState({ value });
        this.setState({ selectedValue: event.target.value });
    };

    render() {
        const { value, ...other } = this.props;

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="xs"
                onEntering={this.handleEntering}
                aria-labelledby="confirmation-dialog-title"
                {...other}
            >
                <DialogTitle id="confirmation-dialog-title">POI List</DialogTitle>
                <DialogContent>
                    <RadioGroup
                        onChange={this.handleChange}
                        >
                        {iconName.map((option,index) => (
                            <div key={index.toString()}>
                            <FormControlLabel
                                name={POIMap[index]}
                                aria-label= {index.toString()}
                                checked={this.state.selectedValue === index.toString()}
                                key={option} control={<Radio />} label={POIMap[index]}  value={index.toString()}
                            >
                            </FormControlLabel>
                                <embed src={option}width={20} height={20}/>
                            </div>
                        ))}
                    </RadioGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.handleOk} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

POIChooseDialogRaw.propTypes = {
    onClose: PropTypes.func,
    value: PropTypes.string,
};

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    paper: {
        width: '80%',
        maxHeight: 435,
    },
});

class POIChooseDialog extends React.Component {
    constructor(props){
       super(props)
    }
    state = {
        open: false,
        value: 'Dione',
    };

    handleClickListItem = () => {
        this.setState({ open: true });
    };

    handleClose = value => {
        this.setState({ value, open: false });
    };

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                    <POIChooseDialogRaw
                        classes={{
                            paper: classes.paper,
                        }}
                        open={this.props.open}
                        onClose={this.props.close}
                        value={this.state.value}
                        toPOIHeatMap={this.props.toPOIHeatMap}
                    />
            </div>
        );
    }
}

POIChooseDialog.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(POIChooseDialog);