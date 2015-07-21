'use strict';

var _ = require('lodash');
var R = require('ramda');
var $ = require('jquery');


function getElem(component, ref) {
	var it;
	if (ref && !_.isEmpty(component.refs) && component.refs[ref]) {
		it = component.refs.dragRoot;
	} else {
		it = component;
	}
	return it.getDOMNode();
}


function noop() {}


function getItemByKey(key, coll, value) {
	var result = null;
	coll.some(function(item) { // faster than filter
			let match = (item[key] === value);
			if (match) { result = item; }
			return match;
		});
	return result;
}
var getItemById = R.partial(getItemByKey, 'id');


// get bounding box for all nodes in group
function getGroupBBox(nodes, group) {
	return group.nodeIds
		.map(R.partial(getItemById, nodes))
		.reduce(function(_bounds, node) {
				_bounds.minX = Math.min(_bounds.minX, node.x);
				_bounds.minY = Math.min(_bounds.minY, node.y);
				_bounds.maxX = Math.max(_bounds.maxX, node.x);
				_bounds.maxY = Math.max(_bounds.maxY, node.y);
				return _bounds;
			},
			{
				minX: Infinity,
				minY: Infinity,
				maxX: -Infinity,
				maxY: -Infinity
			}
		);
}


function degToRad(deg) {
	return deg * (Math.PI / 180);
}


function coordsRelativeToElem(elem, xy) {
	var $elem = $(elem);
	var elemOffset = $elem.offset();
	return {
		x: xy.x - elemOffset.left,
		y: xy.y - elemOffset.top,
	};
}

// http://stackoverflow.com/a/6084322/2839801
// http://phrogz.net/svg/drag_under_transformation.xhtml
function unTransform(point, ctm) {
	return point.matrixTransform(ctm/*.inverse()*/);
}
function unTransformFromTo(fromElem, toElem, xy) {
	let point = fromElem.createSVGPoint();
	point.x = xy.x;
	point.y = xy.y;
	let ctm = fromElem.getTransformToElement(toElem);
	return unTransform(point, ctm);
}


module.exports = {
	getItemById,
	getGroupBBox,
	degToRad,
	noop,
	getElem,
	coordsRelativeToElem,
	unTransform,
	unTransformFromTo,
};
