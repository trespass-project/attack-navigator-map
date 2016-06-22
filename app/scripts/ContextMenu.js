'use strict';

const React = require('react');
const d3 = require('d3');
const classnames = require('classnames');
const sf = require('sf');
const helpers = require('./helpers.js');


const halfPI = Math.PI * 0.5;
const arc = d3.svg.arc();


const ContextMenu = React.createClass({
	contextTypes: {
		theme: React.PropTypes.object,
	},

	propTypes: {
		contextMenu: React.PropTypes.any/*.isRequired*/,
	},

	// getDefaultProps: function() {
	// 	return {};
	// },

	renderPiePiece: function(fromAngle, toAngle, innerRadius, outerRadius, index, item) {
		arc.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.startAngle(fromAngle + halfPI)
			.endAngle(toAngle + halfPI);

		let d = arc();

		const inbetweenAngle = fromAngle + 0.5 * (toAngle - fromAngle);
		const inbetweenRadius = innerRadius + 0.5 * (outerRadius - innerRadius);
		const center = {
			x: Math.cos(inbetweenAngle) * inbetweenRadius,
			y: Math.sin(inbetweenAngle) * inbetweenRadius,
		};
		const translate = `translate(${center.x},${center.y})`;

		let iconHTML = { __html: (item.icon || '').trim() };

		const labelLines = item.label.split('\n')
			.map(line => line.trim());

		const groupClasses = classnames({ 'destructive': item.destructive });

		return (
			<g key={`piece-${index}`} className={groupClasses}>
				<path
					className='menu-item'
					d={d}
					onClick={item.action}
				>
				</path>
				<g transform={translate}>
					<text dy='-6' className='icon fa' dangerouslySetInnerHTML={iconHTML} />
					<text dy='7' className='label'>
						{labelLines.map((line) => {
							return <tspan
								key={`label-${line}-${index}`}
								x='0'
								dy='1.1em'
							>
								{line || ''}
							</tspan>;
						})}
					</text>
				</g>
			</g>
		);
	},

	render: function() {
		const that = this;
		const props = this.props;
		const context = this.context;

		if (!props.contextMenu) { return null; }

		const numItems = props.contextMenu.menuItems.length;
		let angleStep = (numItems === 1) ? 160 : context.theme.contextMenu.desiredAngle;
		const maxAngle = 360;
		if (angleStep * numItems > maxAngle) {
			angleStep = maxAngle / numItems;
		}
		const totalAngle = angleStep * numItems;
		const center = -90;
		const startAngle = center - (totalAngle * 0.5);
		// const endAngle = center + (totalAngle * 0.5);

		const pieces = props.contextMenu.menuItems.map(function(item, index) {
			return that.renderPiePiece(
				helpers.degToRad(startAngle + angleStep * index),
				helpers.degToRad(startAngle + angleStep * (index + 1)),
				context.theme.contextMenu.innerRadius,
				context.theme.contextMenu.outerRadius,
				index,
				item
			);
		});

		return (
			<g className='context-menu'
				transform={`translate(${props.contextMenu.x}, ${props.contextMenu.y})`}>
				{pieces}
			</g>
		);
	},

});


module.exports = ContextMenu;
