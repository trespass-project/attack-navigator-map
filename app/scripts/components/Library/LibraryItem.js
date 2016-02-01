'use strict';

let _ = require('lodash');
const constants = require('../../constants.js');
let helpers = require('../../helpers.js');
let React = require('react');
let DragSource = require('react-dnd').DragSource;
let actionCreators = require('../../actionCreators.js');


let LibraryItem = React.createClass({
	propTypes: {
		dispatch: React.PropTypes.func.isRequired,
		editorElem: React.PropTypes.object.isRequired,
		editorTransformElem: React.PropTypes.object.isRequired,
		data: React.PropTypes.object.isRequired,
		// injected by react dnd:
		isDragging: React.PropTypes.bool.isRequired,
		connectDragSource: React.PropTypes.func.isRequired
	},

	renderType: function() {
		const props = this.props;
		if (!props.showType) { return null; }

		return <div className='badge'>
			{props.data.modelComponentType}
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


const spec = {
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
				props.editorElem,
				result.clientOffset
			);
			const modelXY = helpers.unTransformFromTo(
				props.editorElem,
				props.editorTransformElem,
				editorXY
			);

			const item = monitor.getItem();

			// console.log(item.kbType);
			// TODO: ask user for specifics

			const fragment = (item.fragment) // TODO: rename to isFragment
				? item.value
				: { nodes: [item] }; // treat single nodes like fragments

			props.dispatch( actionCreators.importModelFragment(fragment, modelXY) );
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


module.exports = LibraryItem;
