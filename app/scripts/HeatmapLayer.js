const React = require('react');


// const name =
module.exports.name = 'HeatmapLayer';


// const displayName =
module.exports.displayName = 'analysis result heatmap';


// const adjustProps =
module.exports.adjustProps =
function adjustProps(props) {
	// disable validation layer, when heatmap layer is active
	const activeLayersList = props.activeLayersList
		.filter((layer) => (layer.name !== 'ValidationLayer'));
	return Object.assign(
		{},
		props,
		{ activeLayersList }
	);
};


const HeatmapLayer = React.createClass({
	propTypes: {
		graph: React.PropTypes.object.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	contextTypes: {
		theme: React.PropTypes.object,
	},

	render() {
		const props = this.props;
		if (!props.resultsAttacktreeIdHistogram) {
			return null;
		}

		const nodes = props.resultsAttacktreeIdHistogram
			.reduce((acc, item) => {
				const node = props.graph.nodes[item.id];
				// some nodes might not exist
				return (node)
					? [...acc, node]
					: acc;
			}, props.graph.nodes);

		// const { theme } = this.context;

		const r = 45;
		const yShift = 6; // TODO: get label font size

		// TODO: color should depend on frequency?
		const fillColor = 'rgba(255, 40, 0, 0.25)';

		function renderItem(node) {
			return <g
				key={node.id}
				transform={`translate(${node.x}, ${node.y + yShift})`}
			>
				<circle
					className='backgroundCircle'
					cx={0}
					cy={0}
					r={r}
					fill={fillColor}
				/>
			</g>;
		}

		return <g className='layer HeatmapLayer'>
			{nodes.map(renderItem)}
		</g>;
	},
});

module.exports.Component = HeatmapLayer;
