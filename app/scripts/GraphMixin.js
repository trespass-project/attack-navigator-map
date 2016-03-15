'use strict';

const React = require('react');
const R = require('ramda');
const _ = require('lodash');
const classnames = require('classnames');
const helpers = require('./helpers.js');

const ContextMenu = require('./ContextMenu.js');
const BackgroundImage = require('./BackgroundImage.js');
const Group = require('./Group.js');
const Node = require('./Node.js');
const Edge = require('./Edge.js');


const GraphMixin = {
	contextTypes: {
		theme: React.PropTypes.object,
	},

	propTypes: {
		graph: React.PropTypes.object.isRequired,
		editable: React.PropTypes.bool.isRequired,
		isMinimap: React.PropTypes.bool.isRequired,
		minZoom: React.PropTypes.number,
		maxZoom: React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			minZoom: 0.2,
			maxZoom: 5.0,
			isMinimap: false,
		};
	},

	renderGroup: function(group) {
		const props = this.props;
		const context = this.context;

		let bounds = null;
		const extraPadding = 5;
		const s = (context.theme.node.size * 0.5) + (2 * extraPadding);

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
			bounds = helpers.getGroupBBox(props.graph.nodes, group);
			bounds.minX -= s;
			bounds.minY -= s;
			bounds.maxX += s;
			bounds.maxY += s;
		}

		return <Group
			{...props}
			key={group.id}
			hovered={props.hoverGroup && (group.id === props.hoverGroup.id)}
			selected={group.id === props.selectedId}
			group={group}
			x={bounds.minX}
			y={bounds.minY}
			width={bounds.maxX - bounds.minX}
			height={bounds.maxY - bounds.minY}
		/>;
	},

	renderPreviewEdge: function(edge, index, collection) {
		return this.renderEdge(edge, index, collection, true);
	},

	renderEdge: function(edge, index, collection, isPreview) {
		const props = this.props;
		const context = this.context;
		return <Edge
			key={index}
			theme={context.theme}
			graph={props.graph}
			edge={edge}
			isSelected={edge.id === props.selectedId}
			isPreview={isPreview} />;
	},

	renderNode: function(node, index) {
		const props = this.props;
		return <Node
			{...this.props}
			key={index}
			isHovered={props.hoverNodeId && (node.id === props.hoverNodeId)}
			isSelected={node.id === props.selectedId}
			x={node.x}
			y={node.y}
			node={node} />;
	},

	renderBgImage: function(group, index) {
		return <BackgroundImage
			{...this.props}
			key={index}
			group={group}
			groupCenterOffsetX={group._bgImage.groupCenterOffsetX}
			groupCenterOffsetY={group._bgImage.groupCenterOffsetY}
			width={group._bgImage.width || 500}
			height={group._bgImage.height || 500} />;
	},

	renderVisibleRect: function() {
		const props = this.props;
		const context = this.context;
		if (props.isMinimap && props.visibleRect) {
			return (
				<g transform={`translate(${props.visibleRect.x}, ${props.visibleRect.y})`}>
					<rect
						className='minimap-visible-rect'
						strokeWidth={context.theme.minimap.viewport.strokeWidth / props.constantScale}
						width={props.visibleRect.width}
						height={props.visibleRect.height}>
					</rect>
				</g>
			);
		} else {
			return null;
		}
	},

	_renderMap: function() {
		const props = this.props;
		const graph = props.graph;

		return (
			/* prevent event propagation from map up to svg elem */
			<g ref='map-group' onClick={ (event) => { event.stopPropagation(); } }>
				{R.values(graph.groups)
					.filter(function(group) {
						return !!group._bgImage;
					})
					.map(this.renderBgImage)
				}
				{R.values(graph.groups)
					.map(this.renderGroup)
				}
				{(props.showEdges)
					? R.values(graph.edges)
						.map(this.renderEdge)
					: null
				}
				{(props.previewEdge && !props.isMinimap)
					? [props.previewEdge]
						.map(this.renderPreviewEdge)
					: null
				}
				{R.values(graph.nodes)
					.map(this.renderNode)
				}
				{this.renderVisibleRect()}
			</g>
		);
	},

	_render: function() {
		const props = this.props;
		const graph = props.graph;

		const scale = (props.isMinimap) ? props.constantScale : props.scale;
		let panX = (props.isMinimap) ? (props.panX * props.constantScale) : props.panX;
		let panY = (props.isMinimap) ? (props.panY * props.constantScale) : props.panY;

		if (props.isMinimap) {
			// TODO: s.th. goes wrong here when map is empty
			panX = panX || 0;
			panY = panY || 0;
		}

		const classNames = classnames(
			'graph',
			{
				'editable': props.editable,
				'not-editable': !props.editable,
				'pannable': props.pannable,
				'panning': props.panning
			}
		);

		return (
			<div id={props.id} className='graph-container'>
				<svg
					ref='dragRoot'
					className={classNames}
					onContextMenu={this._onContextMenu || helpers.noop}
					onMouseMove={this._onMouseMove || helpers.noop}
					onMouseLeave={this._onMouseLeave || helpers.noop}
					onMouseUp={this._onMouseUp || helpers.noop}
					onWheel={this._onWheel || helpers.noop}
					onClick={this._onClick || helpers.noop}
				>
					<g ref='panZoom'
					   transform={`matrix(${scale}, 0, 0, ${scale}, ${panX}, ${panY})`}>
						{this._renderMap()}
					</g>
					{(props.editable) ? <ContextMenu {...this.props} /> : null}
				</svg>
			</div>
		);
	},

	render: function() {
		const props = this.props;
		const connectDropTarget = props.connectDropTarget || _.identity;
		return connectDropTarget(this._render());
	},
};


module.exports = GraphMixin;
