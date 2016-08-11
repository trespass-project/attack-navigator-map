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

		const r = theme.node.size + theme.node.cornerRadius;
		const yShift = 6; // TODO: get label font size

		function renderItem(node, message) {
			return <g
				key={node.id}
				transform={`translate(${node.x}, ${node.y + yShift})`}
			>
				<circle
					className='backgroundCircle'
					r={r} cx={0} cy={0}
				/>
				<g transform={`translate(${r / -3}, ${r + 10})`}>
					<text className='errorText'>
						<tspan x='0' dy='0'>{message}</tspan>
					</text>
				</g>
			</g>;
		}

		return <g className='layer validationLayer'>
			{warnings
				.map((item) => {
					const { message, id } = item;
					return renderItem(props.graph.nodes[id], message);
				})
			}
		</g>;
	},
});

module.exports.Component = ValidationLayer;
