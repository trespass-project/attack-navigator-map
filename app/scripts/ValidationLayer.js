const React = require('react');
const R = require('ramda');


const name =
module.exports.name = 'ValidationLayer';

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

		const warnings = R.values(props.graph.nodes)
			.filter(R.propEq('modelComponentType', 'actor'))
			.filter((item) => {
				return !item['tkb:actor_type'];
			})
			.reduce((acc, item) => {
				const message = 'actor does not have an actor type';
				acc[item.id] = message;
				return acc;
			}, {});

		const r = 50;

		return <g className='layer'>
			{R.values(props.graph.nodes).map((node) => {
				const message = warnings[node.id];
				if (!message) {
					return null;
				}

				return <g transform={`translate(${node.x}, ${node.y})`}>
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
