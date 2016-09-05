const React = require('react');
// const R = require('ramda');


// const name =
module.exports.name = 'HighlightLayer';


// const displayName =
// module.exports.displayName = 'highlight layer';
module.exports.displayName = undefined;


// const adjustProps =
module.exports.adjustProps = undefined
/*function adjustProps(props) {
	return Object.assign(
		{},
		props,
		{ highlightIds: R.keys(props.graph.nodes) }
	);
}*/;


const HighlightLayer = React.createClass({
	propTypes: {
		graph: React.PropTypes.object.isRequired,
		highlightIds: React.PropTypes.array,
	},

	getDefaultProps() {
		return {
			highlightIds: [],
		};
	},

	contextTypes: {
		theme: React.PropTypes.object,
	},

	render() {
		const props = this.props;
		// const { theme } = this.context;

		if (!props.highlightIds.length) {
			return null;
		}
		const nodes = props.highlightIds
			.map((id) => props.graph.nodes[id]);

		const r = 45;
		const yShift = 6; // TODO: get label font size

		const inverseScale = 1 / props.scale;
		const scaled100Percent = `${100 * inverseScale}%`;
		const overlayX = -inverseScale * props.panX;
		const overlayY = -inverseScale * props.panY;

		return <g className='layer highlightLayer'>
			<defs>
				<mask id='mask'>
					<rect
						fill='white'
						x={overlayX}
						y={overlayY}
						width={scaled100Percent}
						height={scaled100Percent}
					/>
					{nodes.map((node) => {
						return <g
							key={node.id}
							transform={`translate(${node.x}, ${node.y + yShift})`}
						>
							<circle
								r={r}
								cx='0'
								cy='0'
								fill='black'
							/>
						</g>;
					})}
				</mask>
			</defs>

			<rect
				className='overlay'
				x={overlayX}
				y={overlayY}
				width={scaled100Percent}
				height={scaled100Percent}
				mask='url(#mask)'
			/>
		</g>;
	},
});

module.exports.Component = HighlightLayer;
