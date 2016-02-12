'use strict';

let R = require('ramda');
let React = require('react');
let reactDOM = require('react-dom');
let classnames = require('classnames');
let SchleppMixin = require('./SchleppMixin.js');
let Port = require('./Port.js');
let icons = require('./icons.js');
let helpers = require('./helpers.js');
let actionCreators = require('./actionCreators.js');


const typeIcons = {
	location: 'fa-square-o',
	// asset: 'fa-file-o',
	data: 'fa-file-o',
	item: 'fa-laptop',
	actor: 'fa-male',
	role: 'fa-user',
	predicate: 'fa-tags',
	process: 'fa-gears',
	policy: 'fa-ban',
};


let Node = React.createClass({
	mixins: [SchleppMixin],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		hovered: React.PropTypes.bool,
		selected: React.PropTypes.bool,
		theme: React.PropTypes.object.isRequired,
		node: React.PropTypes.object.isRequired,
	},

	getDefaultProps: function() {
		return {
			selected: false,
			hovered: false,
		};
	},

	renderIcon: function() {
		const props = this.props;
		if (!props.showGroupLabels) { return null; }
		const icon = icons[typeIcons[props.node.modelComponentType]];
		return <text
			ref='icon'
			className='icon fa'
			x='0'
			y='2'
			dangerouslySetInnerHTML={{__html: icon}}></text>;
	},

	renderLabel: function() {
		const props = this.props;
		if (!props.showGroupLabels) { return null; }
		let label = props.node.label || 'no label';
		label = helpers.ellipsize(15, label);
		return <text ref='label' className='label' x='0' y={10+props.theme.node.size*0.5}>
			{label}
		</text>;
	},

	render: function() {
		const props = this.props;
		const radius = props.theme.node.size * 0.5;

		// DON'T TOUCH THIS!
		// trying to 'clean this up' resulted in dragging edges
		// not working anymore, previously.
		const portStyle = (!props.hovered)
			? { display: 'none' }
			: {};

		return (
			<g
				className='node-group'
				transform={'translate('+props.x+','+props.y+')'}
				onContextMenu={this._onContextMenu}
				onClick={this._onClick}
				onMouseEnter={this._handleHover}
				onMouseLeave={this._handleHoverOut}>
				<g ref='dragRoot'>
					<rect
						className={classnames('node', { 'hover': props.hovered, 'selected': props.selected })}
						x={-radius}
						y={-radius}
						rx={props.theme.node.cornerRadius}
						ry={props.theme.node.cornerRadius}
						height={radius*2}
						width={radius*2} />
					{this.renderLabel()}
					{this.renderIcon()}
				</g>
				{(props.editable)
					? <Port
						style={portStyle}
						x={0}
						y={-radius}
						size={props.theme.port.size}
						node={props.node}
						editorElem={props.editorElem}
						editorTransformElem={props.editorTransformElem}
						hoverNode={props.hoverNode}
						dragNode={props.dragNode}
						dispatch={props.dispatch} />
					: null
				}
			</g>
		);
	},

	_onContextMenu: function(event) {
		const props = this.props;

		const menuItems = [
			{	label: 'delete',
				destructive: true,
				icon: icons['fa-trash'],
				action: function() {
					props.dispatch( actionCreators.removeNode(props.node) );
				}
			},
			{	label: 'clone',
				icon: icons['fa-files-o'],
				action: function() {
					props.dispatch( actionCreators.cloneNode(props.node) );
				}
			},
			{	label: 'remove\nfrom group',
				icon: icons['fa-object-group'],
				action: function() {
					props.dispatch( actionCreators.ungroupNode(props.node) );
				}
			},
		];

		props.dispatch( actionCreators.showContextMenu(event, menuItems) );
	},

	// _getLabelWidth: function() {
	// 	var label = this.refs.label;
	// 	var bbox = label.getBBox();
	// 	var width = bbox.width;
	// 	return width;
	// },

	// _positionPorts: function() {
	// 	var w = this._getLabelWidth();
	// 	this.setState({
	// 		portPosX: props.theme.port.size+props.theme.label.fontSize+w*0.5
	// 	});
	// },

	// componentDidMount: function() {
	// 	// this._positionPorts();
	// },

	// componentDidUpdate: function() {
	// 	if (!this.state.portPosX)
	// 		this._positionPorts();
	// },

	// getInitialState: function() {
	// 	return {};
	// },

	_onClick: function(event) {
		const props = this.props;
		event.preventDefault();
		event.stopPropagation();
		props.dispatch( actionCreators.select(props.node.id, 'node') );
	},

	_onDragStart: function(event) {
		const props = this.props;
		const node = props.node;

		props.dispatch( actionCreators.setDragNode(node) );

		this.originalPositionX = node.x;
		this.originalPositionY = node.y;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);
	},

	_onDragMove: function(event) {
		const props = this.props;

		// get event coords in model space
		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{ x: event.clientX,
			  y: event.clientY }
		);

		const modelXYDelta = {
			x: (modelXYEvent.x - this.modelXYEventOrigin.x),
			y: (modelXYEvent.y - this.modelXYEventOrigin.y),
		};

		props.dispatch(
			actionCreators.moveNode(
				props.node.id, {
					x: this.originalPositionX + modelXYDelta.x,
					y: this.originalPositionY + modelXYDelta.y,
				}
			)
		);
	},

	_onDragEnd: function(event) {
		// TODO: DRY (almost same code as in <Dropzone>)

		// for every group
			// check if node is inside the bounds of group
				// if yes, add node to group
		const props = this.props;
		const graph = props.graph;
		const groups = graph.groups;
		const node = props.node;
		const halfSize = 0.5 * props.theme.node.size;
		const dropGroups = groups.filter(function(group) {
			const groupRect = helpers.getGroupBBox(graph.nodes, group);
			const nodeRect = {
				x: node.x - halfSize,
				y: node.y - halfSize,
				width: props.theme.node.size,
				height: props.theme.node.size,
			};
			const groupCenter = {
				x: groupRect.x + groupRect.width * 0.5,
				y: groupRect.y + groupRect.height * 0.5,
			};
			// console.log(helpers.distBetweenPoints(node, groupCenter));
			// if (helpers.isRectInsideRect(nodeRect, groupRect)
			// 	|| helpers.isRectInsideRect(groupRect, nodeRect) // or, when group is smaller than node
			// 	) {
				// check if actually inside dropzone
				if (helpers.distBetweenPoints(nodeRect, groupCenter) <= props.theme.group.dropzoneRadius) {
					return true;
				}
			// }
			return false;
		});
		if (dropGroups.length) {
			props.dispatch(
				actionCreators.addNodeToGroup(node.id, R.last(dropGroups).id)
			);
		}

		props.dispatch( actionCreators.setDragNode(null) );
	},

	_handleHover: function(event) {
		const props = this.props;
		props.dispatch( actionCreators.setHoverNode(props.node) );
	},

	_handleHoverOut: function(event) {
		const props = this.props;
		props.dispatch( actionCreators.setHoverNode(null) );
	}
});


module.exports = Node;
