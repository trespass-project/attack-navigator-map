const React = require('react');
const R = require('ramda');


const name =
module.exports.name = 'ValidationLayer';


const displayName =
module.exports.displayName = 'validation layer';


const adjustProps =
module.exports.adjustProps = undefined;
// function adjustProps(props) {
// 	return Object.assign({}, props, { showNodeLabels: false });
// };


const ValidationLayer = React.createClass({
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
		const { theme } = this.context;

		// TODO: what other warnings can we show?
		const componentWarnings = props.validation.componentWarnings;
		const warnings = R.values(componentWarnings);

		const r = 45;
		const yShift = 6; // TODO: get label font size

		function renderItem(node, item) {
			return <g
				key={node.id}
				transform={`translate(${node.x}, ${node.y + yShift})`}
			>
				<circle
					className='backgroundCircle'
					cx={0}
					cy={0}
					r={r}
				/>
				<g transform={`translate(${r / -3}, ${r + 10})`}>
					<text className='errorText'>
						{item.messages
							.map((message, index) => {
								return <tspan key={index} x='0' dy={index * 12}>{message}</tspan>;
							})
						}
					</text>
				</g>
			</g>;
		}

		return <g className='layer validationLayer'>
			{warnings.map((item) => renderItem(props.graph.nodes[item.id], item))}
		</g>;
	},
});

module.exports.Component = ValidationLayer;
