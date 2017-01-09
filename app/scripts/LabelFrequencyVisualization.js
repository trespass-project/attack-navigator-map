import React from 'react';
const DividingSpace = require('./DividingSpace.js');


const LabelFrequencyVisualization = React.createClass({
	propTypes: {
		labelsHistogram: React.PropTypes.array.isRequired,
		onHover: React.PropTypes.func,
		onHoverOut: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			labelsHistogram: [],
			onHover: () => {},
			onHoverOut: () => {},
		};
	},

	renderItem(item, index) {
		const { props } = this;
		const opacity = parseFloat(
			(item.count / props.labelsHistogram[0].count).toFixed(2),
			10
		);
		const style = {
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			backgroundColor: `rgba(255, 40, 0, ${opacity})`,
		};
		return <div key={item.value}>
			<DividingSpace />
			<div
				style={style}
				onMouseEnter={(event) => {
					event.preventDefault();
					props.onHover(item.value);
				}}
				onMouseLeave={(event) => {
					event.preventDefault();
					props.onHoverOut();
				}}
			>
				<strong>{item.count}</strong> <span>{item.value}</span>
			</div>
		</div>;
	},

	render() {
		const { props } = this;
		return <div>
			{props.labelsHistogram.map(this.renderItem)}
		</div>;
	},
});

module.exports = LabelFrequencyVisualization;
