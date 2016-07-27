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
		// TODO: do this somewhere higher up, so that same warnings can
		// be used in wizard, as well (DRY)
		const warnings = R.values(props.graph.nodes)
			.filter(R.propEq('modelComponentType', 'actor'))
			.filter((item) => !item['tkb:actor_type'])
			.reduce((acc, item) => {
				const message = 'missing actor type';
				acc[item.id] = message;
				return acc;
			}, {});

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
			{R.values(props.graph.nodes)
				.map((node) => {
					const message = warnings[node.id];
					return (!message)
						? null
						: renderItem(node, message);
				})
			}
		</g>;
	},
});

module.exports.Component = ValidationLayer;
