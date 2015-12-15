'use strict';

let React = require('react');
let actionCreators = require('./actionCreators.js');
let helpers = require('./helpers.js');
const constants = require('./constants.js');


let MainMenu = React.createClass({
	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {

	// 	};
	// },

	render: function() {
		const props = this.props;

		return (
			<div id={props.id}>
				<button
					className='btn btn-default btn-xs'
					onClick={this.toggleImages} >
					{(props.showImages) ? 'hide' : 'show'} images
				</button>
				<button
					className='btn btn-default btn-xs'
					onClick={this.toggleGroups} >
					{(props.showGroups) ? 'hide' : 'show'} groups
				</button>
				<button
					className='btn btn-default btn-xs'
					onClick={this.toggleEdges} >
					{(props.showEdges) ? 'hide' : 'show'} edges
				</button>
				<button
					className='btn btn-default btn-xs'
					onClick={this.resetTransformation} >
					reset transformation
				</button>
				<button
					className='btn btn-default btn-xs'
					onClick={this.autoLayout} >
					auto-layout
				</button>
			</div>
		);
	},

	toggleImages: function(event) {
		this.props.dispatch( actionCreators.setShowImages(!this.props.showImages) );
	},

	toggleGroups: function(event) {
		this.props.dispatch( actionCreators.setShowGroups(!this.props.showGroups) );
	},

	toggleEdges: function(event) {
		this.props.dispatch( actionCreators.setShowEdges(!this.props.showEdges) );
	},

	resetTransformation: function(event) {
		this.props.dispatch( actionCreators.resetTransformation() );
	},

	autoLayout: function() {
		this.props.dispatch( actionCreators.autoLayout() );
	}

});


module.exports = MainMenu;
