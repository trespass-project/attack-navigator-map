const $ = require('jquery');
const _ = require('lodash');
const R = require('ramda');
const classnames = require('classnames');
const React = require('react');
const SchleppMixin = require('./SchleppMixin.js');
const icons = require('./icons.js');
const helpers = require('./helpers.js');
const actionCreators = require('./actionCreators.js');


const Dropzone = React.createClass({
	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		radius: React.PropTypes.number.isRequired,
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		showGroupLabels: React.PropTypes.bool,
		isHovered: React.PropTypes.bool,
		isSelected: React.PropTypes.bool,
		nodes: React.PropTypes.object,
	},

	getDefaultProps() {
		return {
			showGroupLabels: true,
			isHovered: false,
			isSelected: false,
		};
	},

	render() {
		const props = this.props;
		return (
			<g transform={`translate(${props.x}, ${props.y})`}>
				<circle
					className='dropzone'
					cx={0}
					cy={0}
					r={props.radius}
				/>
			</g>
		);
	},
});


const Group = React.createClass({
	mixins: [SchleppMixin],

	contextTypes: {
		theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	propTypes: {
		group: React.PropTypes.object.isRequired,
		isHovered: React.PropTypes.bool,
		isSelected: React.PropTypes.bool,
		showGroupLabels: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			isHovered: false,
			isSelected: false,
			showGroupLabels: true,
		};
	},

	renderLabel(x, y) {
		return <text
			dx={x}
			dy={y}
			className='label'
		>{this.props.group.label}</text>;
	},

	renderDropzone() {
		return null;
		const props = this.props;
		const context = this.context;

		if (props.dragNode
			&& !R.contains(props.dragNodeId, props.group.nodeIds)) {
			const dragNode = props.nodes[props.dragNodeId];
			const groupRect = {
				x: props.x,
				y: props.y,
				width: props.width,
				height: props.height,
			};
			const halfSize = 0.5 * context.theme.node.size;
			const nodeRect = {
				x: dragNode.x - halfSize,
				y: dragNode.y - halfSize,
				width: context.theme.node.size,
				height: context.theme.node.size,
			};
			if (helpers.isRectInsideRect(nodeRect, groupRect) ||
				helpers.isRectInsideRect(groupRect, nodeRect) // or, when group is smaller than node
				) {
				return <Dropzone
					group={props.group}
					radius={context.theme.group.dropzoneRadius}
					x={props.width*0.5}
					y={props.height*0.5}
				/>;
			}
		}

		return null;
	},

	render() {
		const props = this.props;
		const context = this.context;
		const { group } = props;

		let bounds = null;
		const extraPadding = 5;
		const extraPaddingBottom = 20 - extraPadding;
		const s = (context.theme.node.size * 0.5) + (2 * extraPadding);

		// TODO: memoize bounds
		if (group.nodeIds.length === 0) {
			const xOffset = group.x || 0;
			const yOffset = group.y || 0;
			bounds = { // TODO: improve this
				minX: xOffset + extraPadding,
				minY: yOffset + extraPadding,
				maxX: xOffset + s,
				maxY: yOffset + s,
			};
		} else {
			bounds = helpers.getGroupBBox(props.nodes, group);
			bounds.minX -= s;
			bounds.minY -= s;
			bounds.maxX += s;
			bounds.maxY += (s + extraPaddingBottom);
		}

		const width = bounds.maxX - bounds.minX;
		const height = bounds.maxY - bounds.minY;
		const x = this._x = bounds.minX;
		const y = this._y = bounds.minY;

		return (
			<g
				className='group-group'
				onClick={this._onClick}
				onContextMenu={this._onContextMenu}
				onMouseEnter={this._handleHover}
				onMouseLeave={this._handleHoverOut}
				transform={`translate(${x}, ${y})`}
			>
				<rect
					className={classnames(
						'group',
						{ 'selected': props.isSelected }
					)}
					rx={context.theme.group.cornerRadius}
					ry={context.theme.group.cornerRadius}
					width={width}
					height={height}
				>
				</rect>
				{(props.showGroupLabels) && this.renderLabel(
					width * 0.5,
					/*height*0.5 + 16*/ -10
				)}
				{this.renderDropzone()}
			</g>
		);
	},

	_handleHover(event) {
		this.context.dispatch(
			actionCreators.setHoverGroup(this.props.group.id)
		);
	},

	_handleHoverOut(event) {
		this.context.dispatch(
			actionCreators.setHoverGroup(null)
		);
	},

	_onContextMenu(event) {
		const context = this.context;
		const props = this.props;

		const bgimg = {
			label: 'background\nimage',
			icon: icons['fa-plus'],
			action: this.openFileDialog
		};
		if (!_.isEmpty(props.group._bgImage)) {
			bgimg.icon = icons['fa-remove'];
			bgimg.action = () => {
				context.dispatch(
					actionCreators.removeGroupBackgroundImage(props.group.id)
				);
			};
		}

		const menuItems = [
			{ label: 'delete', destructive: true, icon: icons['fa-trash'], action:
				(/*event*/) => {
					context.dispatch( actionCreators.removeGroup(props.group.id, true) );
				}
			},
			{ label: 'ungroup', destructive: true, icon: icons['fa-remove'], action:
				(/*event*/) => {
					context.dispatch( actionCreators.removeGroup(props.group.id) );
				}
			},
			{ label: 'clone', icon: icons['fa-files-o'], action:
				() => {
					context.dispatch( actionCreators.cloneGroup(props.group.id) );
				}
			},
			{ label: 'save as\npattern', icon: icons['fa-floppy-o'], action:
				() => {
					context.dispatch( actionCreators.saveGroupAsModelPattern(props.group.id) );
				}
			},
			bgimg
		];
		context.dispatch( actionCreators.showContextMenu(event, menuItems) );
	},

	openFileDialog() {
		const $addfile = $('#add-file');
		$addfile.on('change', this.loadBackgroundFile);
		$addfile.click();
	},

	loadBackgroundFile(event) { // TODO: do this elsewhere
		const props = this.props;

		const file = $('#add-file')[0].files[0];
		const reader = new FileReader();
		reader.onload = (event) => {
			const svg = event.target.result;
			const $svg = $($.parseXML(svg)).find('svg').first();
			const w = parseFloat($svg.attr('width'));
			const h = parseFloat($svg.attr('height'));
			const aspectRatio = w / h;
			// const dataURI = `data:image/svg+xml;utf8,${svg}`;
			const dataURI = `data:image/svg+xml;base64,${btoa(svg)}`;
			this.context.dispatch(
				actionCreators.addGroupBackgroundImage(props.group.id, dataURI, aspectRatio, w)
			);
		};
		// reader.readAsDataURL(file);
		reader.readAsText(file);

		$('#add-file').off('change', this.loadBackgroundFile);
	},

	_onClick(event) {
		event.preventDefault();
		event.stopPropagation();
		this.context.dispatch(
			actionCreators.select(this.props.group.id, 'group')
		);
	},

	_onMouseOver(event) {
		this.context.dispatch(
			actionCreators.setHoverGroup(this.props.group.id)
		);
	},

	_onMouseOut(event) {
		this.context.dispatch(
			actionCreators.setHoverGroup(null)
		);
	},

	_onDragStart(event) {
		const props = this.props;

		this.originalPositionX = this._x;
		this.originalPositionY = this._y;

		this.modelXYEventOrigin = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{
				x: event.clientX,
				y: event.clientY,
			}
		);
	},

	_onDragMove(event) {
		const props = this.props;

		this.currentPositionX = this._x;
		this.currentPositionY = this._y;

		const modelXYEvent = helpers.unTransformFromTo(
			props.editorElem,
			props.editorTransformElem,
			{
				x: event.clientX,
				y: event.clientY,
			}
		);

		const modelXYDelta = {
			x: (modelXYEvent.x - this.modelXYEventOrigin.x),
			y: (modelXYEvent.y - this.modelXYEventOrigin.y),
		};

		const newPositionX = this.originalPositionX + modelXYDelta.x;
		const newPositionY = this.originalPositionY + modelXYDelta.y;

		this.context.dispatch(
			actionCreators.moveGroup(
				props.group.id,
				{ // delta of the delta
					x: newPositionX - this.currentPositionX,
					y: newPositionY - this.currentPositionY
				}
			)
		);
	},

	_onDragEnd(event) {
		//
	}
});


module.exports = Group;
