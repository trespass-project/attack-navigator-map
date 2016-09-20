const React = require('react');
const _ = require('lodash');
const constants = require('../../constants.js');
const DragSource = require('react-dnd').DragSource;
const modelHelpers = require('../../model-helpers.js');
const actionCreators = require('../../actionCreators.js');


let LibraryItem = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired,
		showType: React.PropTypes.bool,
		deletable: React.PropTypes.bool,
		x: React.PropTypes.element,
		onRemove: React.PropTypes.func,
		// injected by react dnd:
		isDragging: React.PropTypes.bool.isRequired,
		connectDragSource: React.PropTypes.func.isRequired
	},

	contextTypes: {
		// theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			showType: false,
			deletable: false,
			x: <span>delete</span>,
			onRemove: () => {},
		};
	},

	handleClickRemove(event) {
		event.preventDefault();
		this.props.onRemove();
	},

	renderType() {
		const props = this.props;
		if (!props.showType) { return null; }

		return <span className='badge'>
			{props.data.modelComponentType}
		</span>;
	},

	render() {
		const props = this.props;
		const connectDragSource = props.connectDragSource;

		return connectDragSource(
			<li key={props.data.label} className='list-group-item clearfix'>
				<div style={{ float: 'left' }}>
					<span>
						{/*this.renderType()*/}
						<div className='iconContainer'>
							<img
								src={props.data.icon
									.replace('/types/', '/types_black/')
								}
							/>
						</div>
						<span className='normal'>{props.data.label}</span>
					</span>
					<span className='draghint'>
						Drag me onto map
					</span>
				</div>
				<div
					style={{ float: 'right' }}
					className='remove'
					onClick={this.handleClickRemove}
				>
					{(props.deletable) && props.x}
				</div>
			</li>
		);
	},
});


const spec = {
	beginDrag(props, monitor, component) {
		// needs to be a copy
		return _.merge({}, props.data);
	},

	endDrag(props, monitor, component) {
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
