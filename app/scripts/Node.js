const R = require('ramda');
const React = require('react');
const classnames = require('classnames');
const SchleppMixin = require('./SchleppMixin.js');
const Port = require('./Port.js');
const icons = require('./icons.js');
const helpers = require('./helpers.js');
const actionCreators = require('./actionCreators.js');

const { colorScales } = require('trespass-visualizations').color;
const domain = [0, 1];
const virtualScale = colorScales.virtual(domain);
const physicalScale = colorScales.physical(domain);
const componentTypeColorScales = {
	location: physicalScale,
	actor: physicalScale,
	data: virtualScale,

	// TODO: could be both
	// item: physicalScale,
};


const Node = React.createClass({
	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		isHovered: React.PropTypes.bool,
		isSelected: React.PropTypes.bool,
		showNodeLabels: React.PropTypes.bool,
		node: React.PropTypes.object.isRequired,

		// TODO: context
		// editorElem: React.PropTypes.object.isRequired,
		// editorTransformElem: React.PropTypes.object.isRequired,
	},

	contextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	mixins: [SchleppMixin],

	getDefaultProps() {
		return {
			isSelected: false,
			isHovered: false,
			showNodeLabels: true,
		};
	},

	_onContextMenu(event) {
		const context = this.context;
		const props = this.props;

		const menuItems = [
			{	label: 'delete',
				destructive: true,
				icon: icons['fa-trash'],
				action: () => {
					context.dispatch( actionCreators.removeNode(props.node.id) );
				}
			},
			{	label: 'clone',
				icon: icons['fa-files-o'],
				action: () => {
					context.dispatch( actionCreators.cloneNode(props.node.id) );
				}
			},
			{	label: 'remove\nfrom group',
				icon: icons['fa-object-group'],
				action: () => {
					context.dispatch( actionCreators.ungroupNode(props.node.id) );
				}
			},
		];

		context.dispatch( actionCreators.showContextMenu(event, menuItems) );
	},

	_onClick(event) {
		event.preventDefault();
		event.stopPropagation();
		this.context.dispatch(
			actionCreators.select(this.props.node.id, 'node')
		);
	},

	_onDragStart(event) {
		const props = this.props;
		const node = props.node;

		this.context.dispatch(
			actionCreators.setDragNode(node.id)
		);

		this.originalPositionX = node.x;
		this.originalPositionY = node.y;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{
				x: event.clientX,
				y: event.clientY
			}
		);
	},

	_onDragMove(event) {
		const props = this.props;

		// get event coords in model space
		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{
				x: event.clientX,
				y: event.clientY
			}
		);

		const modelXYDelta = {
			x: (modelXYEvent.x - this.modelXYEventOrigin.x),
			y: (modelXYEvent.y - this.modelXYEventOrigin.y),
		};

		this.context.dispatch(
			actionCreators.moveNode(
				props.node.id,
				{
					x: this.originalPositionX + modelXYDelta.x,
					y: this.originalPositionY + modelXYDelta.y,
				}
			)
		);
	},

	_onDragEnd(event) {
		// TODO: DRY (almost same code as in <Dropzone>)

		// for every group
			// check if node is inside the bounds of group
				// if yes, add node to group
		const context = this.context;
		const props = this.props;
		const graph = props.graph;
		const groups = graph.groups;
		const node = props.node;
		const halfSize = 0.5 * context.theme.node.size;
		const dropGroups = R.values(groups)
			.filter((group) => {
				const groupRect = helpers.getGroupBBox(graph.nodes, group);
				const nodeRect = {
					x: node.x - halfSize,
					y: node.y - halfSize,
					width: context.theme.node.size,
					height: context.theme.node.size,
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
					if (helpers.distBetweenPoints(nodeRect, groupCenter) <= context.theme.group.dropzoneRadius) {
						return true;
					}
				// }
				return false;
			});

		if (dropGroups.length) {
			context.dispatch(
				actionCreators.addNodeToGroup(node.id, R.last(dropGroups).id)
			);
		}

		context.dispatch( actionCreators.setDragNode(null) );
	},

	_handleHover(event) {
		this.context.dispatch(
			actionCreators.setHoverNode(this.props.node.id)
		);
	},

	_handleHoverOut(event) {
		this.context.dispatch(
			actionCreators.setHoverNode(null)
		);
	},

	renderIcon(shapeSizeScaled) {
		const props = this.props;
		const { node } = props;


		if (!props.showNodeLabels) { return null; }

		// types might not be loaded yet at this point?
		const component = props.componentsLibMap[node.type];
		let icon = (!component)
			? undefined
			: component.icon;

		// more fine-grained icons, depending on certain
		// attribute values
		if (node['tkb:actor_type']) {
			// for instance "tkb:actor_management"
			if (component) {
				const attribs = props.kbTypeAttributes[node.type];
				const actorTypeAttrib = R.find(R.propEq('id', 'tkb:actor_type'))(attribs);
				const type = R.find(R.propEq('@id', node['tkb:actor_type']))(actorTypeAttrib.values);
				icon = type['tkb:icon'] || icon;
			}
		}

		return <image
			xlinkHref={icon}
			x={-shapeSizeScaled / 2}
			y={-shapeSizeScaled / 2}
			width={shapeSizeScaled}
			height={shapeSizeScaled}
		/>;

		// return <text
		// 	ref='icon'
		// 	className='icon fa'
		// 	x='0'
		// 	y='2'
		// 	dangerouslySetInnerHTML={{ __html: icon }}
		// />;
	},

	renderLabel(shapeSize) {
		const props = this.props;

		if (!props.showNodeLabels) { return null; }

		let label = props.node.label || 'no label';
		label = helpers.ellipsize(15, label);

		return <text
			ref='label'
			className='label'
			x='0'
			y={12 + (shapeSize / 2)}
		>
			{label}
		</text>;
	},

	render() {
		const props = this.props;
		const context = this.context;

		const isCountermeasure = false;

		const iconScaleFactor = 1.0; // 0.7

		const shapeSize = isCountermeasure
			? context.theme.countermeasure.size
			: context.theme.node.radius * 2;
		const halfShapeSize = 0.5 * shapeSize;

		const portOffset = isCountermeasure
			? -halfShapeSize
			: -context.theme.node.radius;

		// DON'T TOUCH THIS!
		// trying to 'clean this up' resulted in dragging edges
		// not working anymore, previously.
		const portStyle = (!props.isHovered)
			? { display: 'none' }
			: {};

		const nodeClasses = classnames(
			'node',
			{
				'hover': props.isHovered,
				'selected': props.isSelected
			}
		);

		const needsFill = (!props.isHovered && !props.isSelected);
		const scale = componentTypeColorScales[props.node.modelComponentType];
		let scaleT = undefined;

		// more fine-grained colors
		const node = props.node;
		const component = props.componentsLibMap
			&& props.componentsLibMap[node.type];
		if (component) {
			const attribs = props.kbTypeAttributes[node.type];

			if (node['tkb:actor_type']) {
				const actorTypeAttrib = R.find(R.propEq('id', 'tkb:actor_type'))(attribs);
				const type = R.find(R.propEq('@id', node['tkb:actor_type']))(actorTypeAttrib.values);
				scaleT = type['tkb:soc_eng_probability'] / 100;
			} else if (node['tkb:burglar_resistance']) {
				const actorTypeAttrib = R.find(R.propEq('id', 'tkb:burglar_resistance'))(attribs);
				const type = R.find(R.propEq('@id', node['tkb:burglar_resistance']))(actorTypeAttrib.values);
				scaleT = {
					'tkb:burglar_resistance_class1': 1,
					'tkb:burglar_resistance_class2': 0.66,
					'tkb:burglar_resistance_class3': 0.33,
					'tkb:burglar_resistance_class4': 0,
				}[type['@id']] || 0.5;
			}
		}

		const fillColor = (scaleT !== undefined && needsFill && scale)
			? scale(scaleT)
			: undefined;

		const nodeShape = isCountermeasure
			? <rect
				className={nodeClasses}
				x={-halfShapeSize}
				y={-halfShapeSize}
				rx={context.theme.node.cornerRadius * 0}
				ry={context.theme.node.cornerRadius * 0}
				height={context.theme.countermeasure.size}
				width={context.theme.countermeasure.size}
			/>
			: <circle
				className={nodeClasses}
				cx={0}
				cy={0}
				r={context.theme.node.radius}
				style={{ fill: fillColor }}
			/>;

		return <g
			className='node-group'
			transform={`translate(${props.x}, ${props.y})`}
			onContextMenu={this._onContextMenu}
			onClick={this._onClick}
			onMouseEnter={this._handleHover}
			onMouseLeave={this._handleHoverOut}
		>
			<g ref='dragRoot'>
				{nodeShape}
				{this.renderLabel(shapeSize)}
				{this.renderIcon(shapeSize * iconScaleFactor)}
			</g>
			{(props.editable) &&
				<Port
					style={portStyle}
					x={0}
					y={portOffset}
					size={context.theme.port.size}
					node={props.node}
					editorElem={props.editorElem}
					editorTransformElem={props.editorTransformElem}
					hoverNodeId={props.hoverNodeId}
					dragNodeId={props.dragNodeId}
				/>
			}
		</g>;
	},
});


module.exports = Node;
