'use strict';

const React = require('react');
const reactDOM = require('react-dom');
const R = require('ramda');
const $ = require('jquery');
const helpers = require('./helpers.js');
const Graph = require('./Graph.js');


const GraphMinimap = React.createClass({
	contextTypes: {
		theme: React.PropTypes.object,
	},

	propTypes: {
		constantScale: React.PropTypes.number,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	render: function() {
		const props = this.props;
		const context = this.context;

		const transform = {
			scale: props.constantScale,
			pan: { x: 0, y: 0 }
		};

		if (!transform.scale) {
			if (!this.size) { return null; }

			const nodes = R.values(props.graph.nodes);
			const bbox = helpers.getNodesBBox(nodes);

			// add some padding
			const padding = context.theme.node.size;
			bbox.minX -= padding;
			bbox.maxX += padding;
			bbox.minY -= padding;
			bbox.maxY += padding;
			const bboxSize = {
				width: bbox.maxX - bbox.minX,
				height: bbox.maxY - bbox.minY,
			};
			const bboxAspectRatio = bboxSize.width / bboxSize.height;
			const fit = (this.aspectRatio > bboxAspectRatio) ? 'height' : 'width';
			const scale = this.size[fit] / bboxSize[fit];

			transform.scale = scale;
			transform.pan.x = -bbox.minX;
			transform.pan.y = -bbox.minY;
		}

		const showNodeLabels = false;
		const showEdgeLabels = false;
		const showGroupLabels = false;

		return (
			<div ref='height' id={props.id} className='panel-section'>
				<Graph {...props}
					isMinimap={true}
					constantScale={transform.scale}
					panX={transform.pan.x}
					panY={transform.pan.y}
					showNodeLabels={showNodeLabels}
					showEdgeLabels={showEdgeLabels}
					showGroupLabels={showGroupLabels} />
			</div>
		);
	},

	_setSize: function() {
		const props = this.props;

		const elem = reactDOM.findDOMNode(this);
		const $minimap = $(elem);
		this.size = {
			width: $minimap.width(),
			height: $minimap.height(),
		};
		this.aspectRatio = this.size.width / this.size.height;
	},

	componentDidMount: function() {
		this._setSize();
	},

	componentDidUpdate: function() {
		this._setSize();
	},
});


module.exports = GraphMinimap;
