'use strict';

let _ = require('lodash');
let R = require('ramda');
let $ = require('jquery');


function getElemByRef(component, ref) {
	let it;
	if (ref && !_.isEmpty(component.refs) && component.refs[ref]) {
		it = component.refs.dragRoot;
	} else {
		it = component;
	}
	return it;
}


function noop() {}


function getItemByKey(key, coll, value) {
	return coll
		.filter(function(item) {
			return (item[key] === value);
		})[0] || null;
}
const getItemById = R.partial(getItemByKey, ['id']);


function getNodesBBox(nodes) {
	let bounds = nodes.reduce(
		function(_bounds, node) {
			_bounds.minX = Math.min(_bounds.minX, node.x);
			_bounds.minY = Math.min(_bounds.minY, node.y);
			_bounds.maxX = Math.max(_bounds.maxX, node.x);
			_bounds.maxY = Math.max(_bounds.maxY, node.y);
			return _bounds;
		},
		{ minX: Infinity,
		  minY: Infinity,
		  maxX: -Infinity,
		  maxY: -Infinity }
	);

	if (nodes.length === 0) {
		bounds.minX = bounds.maxX = bounds.minY = bounds.maxY = 0;
	}

	bounds.x = bounds.minX;
	bounds.y = bounds.minY;
	bounds.width = bounds.maxX - bounds.minX;
	bounds.height = bounds.maxY - bounds.minY;

	return bounds;
}


function getGroupInitialPosition(group) {
	return {
		x: group.x || 0,
		y: group.y || 0,
	};
}


// get bounding box for all nodes in group
function getGroupBBox(allNodes, group) {
	const nodes = group.nodeIds.map(R.partial(getItemById, [allNodes]));
	let bbox = getNodesBBox(nodes);
	if (nodes.length === 0) {
		const initialPos = getGroupInitialPosition(group);
		bbox.x = initialPos.x;
		bbox.y = initialPos.y;
		bbox.minX = initialPos.x;
		bbox.maxX = initialPos.x + bbox.width;
		bbox.minY = initialPos.y;
		bbox.maxY = initialPos.y + bbox.height;
	}
	return bbox;
}


function distBetweenPoints(a, b) {
	const x = b.x - a.x;
	const y = b.y - a.y;
	return Math.sqrt(x*x + y*y);
}


function isRectInsideRect(r1, r2) {
	// expects a rect to have: x, y, width, height

	function isBetween(what, low, high) {
		return (what >= low) && (what <= high);
	}

	const insideX = isBetween(r1.x, r2.x, r2.x+r2.width) || isBetween(r1.x+r1.width, r2.x, r2.x+r2.width);
	const insideY = isBetween(r1.y, r2.y, r2.y+r2.height) || isBetween(r1.y+r1.height, r2.y, r2.y+r2.height);

	const inside = insideX && insideY;
	return inside;
}


function getNodeGroups(nodeId, groups) {
	return groups.filter(function(group) {
		return R.contains(nodeId, group.nodeIds);
	});
}


function makeId(index, type) {
	return [Date.now(), index||0, type||''].join('-');
}


function ellipsize(maxLen, s) {
	const E = '…';
	let len = s.length;
	let diff = maxLen - len;
	if (diff < 0) {
		let centerIndex = len / 2;
		let numDel = Math.abs(diff);
		let startIndex = Math.round(centerIndex - (numDel / 2));
		return s.substring(0, startIndex) + E + s.substring(startIndex + numDel);
	} else {
		return s;
	}
}


function degToRad(deg) {
	return deg * (Math.PI / 180);
}


function coordsRelativeToElem(elem, xy) {
	const $elem = $(elem);
	const elemOffset = $elem.offset();
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
	let point = (fromElem.ownerSVGElement || fromElem).createSVGPoint();
	point.x = xy.x;
	point.y = xy.y;
	const ctm = fromElem.getTransformToElement(toElem);
	return unTransform(point, ctm);
}


module.exports = {
	getItemByKey,
	getItemById,
	getNodesBBox,
	getGroupBBox,
	getGroupInitialPosition,
	distBetweenPoints,
	isRectInsideRect,
	getNodeGroups,
	makeId,
	ellipsize,
	degToRad,
	noop,
	getElemByRef,
	coordsRelativeToElem,
	unTransform,
	unTransformFromTo,
};
