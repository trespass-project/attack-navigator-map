'use strict';

const React = require('react');
const actionCreators = require('./actionCreators.js');


const MainMenu = React.createClass({
	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	propTypes: {
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
		this.context.dispatch( actionCreators.setShowImages(!this.props.showImages) );
	},

	toggleGroups: function(event) {
		this.context.dispatch( actionCreators.setShowGroups(!this.props.showGroups) );
	},

	toggleEdges: function(event) {
		this.context.dispatch( actionCreators.setShowEdges(!this.props.showEdges) );
	},

	resetTransformation: function(event) {
		this.context.dispatch( actionCreators.resetTransformation() );
	},

	autoLayout: function() {
		this.context.dispatch( actionCreators.autoLayout() );
	}

});


module.exports = MainMenu;
