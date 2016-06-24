const React = require('react');
const R = require('ramda');


const name =
module.exports.name = 'ValidationLayer';

// TODO: what to do with this?
const editorProps =
module.exports.editorProps = {
	showEdges: false,
};


module.exports.Component =
React.createClass({
	propTypes: {
		graph: React.PropTypes.object.isRequired,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	render() {
		const props = this.props;

		// TODO: more warnings
		// TODO: do this somewhere higher up, so that same warnings can
		// be used in wizard, as well (DRY)
		const warnings = R.values(props.graph.nodes)
			.filter(R.propEq('modelComponentType', 'actor'))
			.filter((item) => {
				return !item['tkb:actor_type'];
			})
			.reduce((acc, item) => {
				const message = 'missing actor type';
				acc[item.id] = message;
				return acc;
			}, {});

		// TODO: make part of theme?
		const r = 45;
		const yShift = 7;

		return <g className='layer'>
			{R.values(props.graph.nodes).map((node) => {
				const message = warnings[node.id];
				if (!message) {
					return null;
				}

				// TODO: outsource css
				return <g transform={`translate(${node.x}, ${node.y + yShift})`}>
					<circle
						fill='rgba(255, 4, 0, 0.25)'
						r={r}
						cx={0}
						cy={0}
					/>
					<g transform={`translate(${r / -3}, ${r + 10})`}>
						<text fill='rgb(255, 40, 0)' style={{ fontSize: 10 }}>
							<tspan x='0' dy='0'>{message}</tspan>
						</text>
					</g>
				</g>;
			})}
		</g>;
	},
});
