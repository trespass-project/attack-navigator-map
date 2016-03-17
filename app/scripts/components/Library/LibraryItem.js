'use strict';

const _ = require('lodash');
const constants = require('../../constants.js');
const helpers = require('../../helpers.js');
const React = require('react');
const DragSource = require('react-dnd').DragSource;
const modelHelpers = require('../../model-helpers.js');
const actionCreators = require('../../actionCreators.js');


let LibraryItem = React.createClass({
	contextTypes: {
		// theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	propTypes: {
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
		if (monitor.didDrop()) {
			const result = monitor.getDropResult();
			if (result.target === constants.DND_TARGET_MAP /*||
				result.target === constants.DND_TARGET_DEBUG*/) {
				const item = monitor.getItem();

				const fragment = (item.isFragment)
					? item.value
					: modelHelpers.nodeAsFragment(item);

				component.context.dispatch(
					actionCreators.dropModelFragment(
						fragment,
						result.clientOffset
					)
				);
			}
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
