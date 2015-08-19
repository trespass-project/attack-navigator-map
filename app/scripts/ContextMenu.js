'use strict';

var React = require('react');
var d3 = require('d3');
var sf = require('sf');
var helpers = require('./helpers.js');


var ContextMenu = React.createClass({
	mixins: [],

	propTypes: {
		theme: React.PropTypes.object.isRequired,
		contextMenu: React.PropTypes.any.isRequired,
	},

	getDefaultProps: function() {
		return {

		};
	},

	_makePiePiece: function(fromAngle, toAngle, innerRadius, outerRadius, index, item) {
		const halfPI = Math.PI * 0.5;
		let arc = d3.svg.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.startAngle(fromAngle + halfPI)
			.endAngle(toAngle + halfPI);

		let d = arc();

		const inbetweenAngle = fromAngle+0.5*(toAngle-fromAngle);
		const inbetweenRadius = innerRadius+0.5*(outerRadius-innerRadius);
		let center = {
			x: Math.cos(inbetweenAngle) * inbetweenRadius,
			y: Math.sin(inbetweenAngle) * inbetweenRadius,
		};
		let translate = sf('translate({0},{1})', center.x, center.y);

		let iconHTML = { __html: (item.icon || '').trim() };
		let labelHTML = { __html: (item.label || '').trim() };

		return (
			<g key={index}>
				<path
					className='menu-item'
					d={d}
					onClick={item.action}>
				</path>
				<g transform={translate}>
					<text dy='-6' className='icon fa' dangerouslySetInnerHTML={iconHTML} />
					<text dy='7' className='label' dangerouslySetInnerHTML={labelHTML} />
				</g>
			</g>
		);
	},

	render: function() {
		var that = this;
		var props = this.props;

		if (!props.contextMenu) { return null; }

		const numItems = props.contextMenu.menuItems.length;
		let angleStep = (numItems === 1) ? 160 : props.theme.contextMenu.desiredAngle;
		const maxAngle = 360;
		if (angleStep * numItems > maxAngle) {
			angleStep = maxAngle / numItems;
		}
		const totalAngle = angleStep * numItems;
		const center = -90;
		const startAngle = center - (totalAngle * 0.5);
		const endAngle = center + (totalAngle * 0.5);

		let pieces = props.contextMenu.menuItems.map(function(item, index) {
			return that._makePiePiece(
				helpers.degToRad(startAngle + angleStep * index),
				helpers.degToRad(startAngle + angleStep * (index + 1)),
				props.theme.contextMenu.innerRadius,
				props.theme.contextMenu.outerRadius,
				index,
				item
			);
		});

		return (
			<g className='context-menu' transform={'translate('+props.contextMenu.x+','+props.contextMenu.y+')'}>
				{pieces}
			</g>
		);
	},

	componentWillMount: function() {
		//
	},

	componentDidMount: function() {
		//
	},

	componentWillReceiveProps: function() {
		//
	},

	componentWillUnmount: function() {
		//
	}

});


module.exports = ContextMenu;
