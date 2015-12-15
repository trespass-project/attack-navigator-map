'use strict';

var $ = require('jquery');
var _ = require('lodash');
var R = require('ramda');
var Q = require('q');
var constants = require('../../constants.js');
var helpers = require('../../helpers.js');
var React = require('react');
var DragSource = require('react-dnd').DragSource;
var actionCreators = require('../../actionCreators.js');


var LibraryItem = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired,
		// injected by react dnd:
		isDragging: React.PropTypes.bool.isRequired,
		connectDragSource: React.PropTypes.func.isRequired
	},

	renderType: function() {
		const props = this.props;
		if (!props.showType) { return null; }

		// TODO: css
		const styles = {
			float: 'right',
			fontWeight: 'normal',
			marginTop: '0.15em'
		};
		return <div className='badge' style={styles}>
			{props.data.type}
		</div>;
	},

	render: function() {
		const props = this.props;
		const connectDragSource = props.connectDragSource;
		return connectDragSource(
			<li key={props.data.label} className='list-group-item'>
				{this.renderType()}
				<div>{props.data.label}</div>
			</li>
		);
	},
});


var spec = {
	beginDrag: function(props, monitor, component) {
		// needs to be a copy
		return _.merge({}, props.data);
	},

	endDrag: function(props, monitor, component) {
		if (!monitor.didDrop()) { return; }

		const result = monitor.getDropResult();
		if (result.target === constants.DND_TARGET_MAP /*||
			result.target === constants.DND_TARGET_DEBUG*/) {

			const editorXY = helpers.coordsRelativeToElem(
				interfaceStore.state.editorElem,
				result.clientOffset
			);
			const modelXY = helpers.unTransformFromTo(
				interfaceStore.state.editorElem,
				interfaceStore.state.editorTransformElem,
				editorXY
			);

			let item = monitor.getItem();
			let fragment;

			if (item.fragment) {
				fragment = item.value;
			} else {
				item.type = item.type;
				fragment = {
					nodes: [item],
					edges: [],
					groups: [],
				};
			}

			fragment = helpers.prepareGraphFragment(fragment);
			this.props.dispatch( actionCreators.importModelFragment(fragment, modelXY) );

			// select
			interfaceActions.select(item, 'node');
		}
	}
};

// the props to be injected
function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
}

// LibraryItem = DragSource(constants.DND_SOURCE_NODE, spec, collect)(LibraryItem);
LibraryItem = DragSource(constants.DND_SOURCE_FRAGMENT, spec, collect)(LibraryItem);


module.exports = LibraryItem
