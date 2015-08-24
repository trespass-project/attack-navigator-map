'use strict';

var _ = require('lodash');
var R = require('ramda');
var $ = require('jquery');


function getElemByRef(component, ref) {
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


function getNodesBBox(nodes) {
	return nodes.reduce(
		function(_bounds, node) {
			_bounds.minX = Math.min(_bounds.minX, node.x);
			_bounds.minY = Math.min(_bounds.minY, node.y);
			_bounds.maxX = Math.max(_bounds.maxX, node.x);
			_bounds.maxY = Math.max(_bounds.maxY, node.y);
			return _bounds;
		},
		{ minX:  Infinity,
		  minY:  Infinity,
		  maxX: -Infinity,
		  maxY: -Infinity }
	);
}

// get bounding box for all nodes in group
function getGroupBBox(allNodes, group) {
	const nodes = group.nodeIds.map(R.partial(getItemById, allNodes));
	return getNodesBBox(nodes);
}


function getNodeGroups(nodeId, groups) {
	var result = [];
	groups.forEach(function(group) {
		if (R.contains(nodeId, group.nodeIds)) {
			result.push(group);
		}
	});
	return result;
}


function prepareGraphFragment(fragment) {
	// prepare fragment

	fragment.nodes.forEach(function(node, index) {
		let oldId = node.id;

		// create unique id
		node.id = makeId(index, node.type);

		// rename existing ids in edges and groups
		if (oldId) {
			fragment.edges.forEach(function(edge) {
				if (edge.from === oldId) {
					edge.from = node.id;
				}
				if (edge.to === oldId) {
					edge.to = node.id;
				}
			});

			fragment.groups.forEach(function(group, index) {
				group.id = makeId(index, 'group');
				group.nodeIds = group.nodeIds.map(function(nodeId) {
					if (nodeId === oldId) {
						return node.id;
					} else {
						return nodeId;
					}
				});
			});
		}
	});

	return fragment;
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
	getNodeGroups,
	prepareGraphFragment,
	makeId,
	ellipsize,
	degToRad,
	noop,
	getElemByRef,
	coordsRelativeToElem,
	unTransform,
	unTransformFromTo,
};
