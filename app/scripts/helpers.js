'use strict';

const _ = require('lodash');
const R = require('ramda');
const $ = require('jquery');
const reactDOM = require('react-dom');
const shortid = require('shortid');


let getElemByRef = module.exports.getElemByRef =
function getElemByRef(component, refName) {
	if (refName && component.refs[refName]) {
		return component.refs[refName];
	} else {
		return reactDOM.findDOMNode(component);
	}
}


let noop = module.exports.noop =
function noop() {}


let getItemByKey = module.exports.getItemByKey =
function getItemByKey(key, coll, value) {
	return R.find( R.propEq(key, value) )(coll);
}
const getItemById = module.exports.getItemById = R.partial(getItemByKey, ['id']);


// TODO: test
let getNodesBBox = module.exports.getNodesBBox =
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


let getGroupInitialPosition = module.exports.getGroupInitialPosition =
function getGroupInitialPosition(group) {
	return {
		x: group.x || 0,
		y: group.y || 0,
	};
}


// TODO: test
// get bounding box for all nodes in group
let getGroupBBox = module.exports.getGroupBBox =
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


let distBetweenPoints = module.exports.distBetweenPoints =
function distBetweenPoints(a, b) {
	const x = b.x - a.x;
	const y = b.y - a.y;
	return Math.sqrt(x * x + y * y);
}


let isBetween = module.exports.isBetween =
function isBetween(what, low, high) {
	return (what >= low) && (what <= high);
}


let isRectInsideRect = module.exports.isRectInsideRect =
function isRectInsideRect(r1, r2) {
	// expects a rect to have: x, y, width, height

	// takes into account the case
	// when r1 (width or height) is bigger than r2,
	// or r1 is completely overlapping r2

	const r1_xPlusWidth = r1.x + r1.width;
	const r1_yPlusHeight = r1.y + r1.height;
	const r2_xPlusWidth = r2.x + r2.width;
	const r2_yPlusHeight = r2.y + r2.height;

	const insideX =
		isBetween(r1.x, r2.x, r2_xPlusWidth) ||
		isBetween(r1_xPlusWidth, r2.x, r2_xPlusWidth) ||
		(
			(r1.width > r2.width) &&
			(
				isBetween(r2.x, r1.x, r1_xPlusWidth) ||
				isBetween(r2_xPlusWidth, r1.x, r1_xPlusWidth)
			)
		);
	const insideY =
		isBetween(r1.y, r2.y, r2_yPlusHeight) ||
		isBetween(r1_yPlusHeight, r2.y, r2_yPlusHeight) ||
		(
			(r1.height > r2.height) &&
			(
				isBetween(r2.y, r1.y, r1_yPlusHeight) ||
				isBetween(r2_yPlusHeight, r1.y, r1_yPlusHeight)
			)
		);

	const inside = insideX && insideY;
	return inside;
}


let areAttackerProfilesEqual = module.exports.areAttackerProfilesEqual =
function areAttackerProfilesEqual(p1, p2) {
	return (p1.intent === p2.intent) &&
		(p1.access === p2.access) &&

		(R.intersection(p1.outcomes, p2.outcomes).length === p1.outcomes.length) &&
		(p1.outcomes.length === p2.outcomes.length) &&

		(p1.limit === p2.limit) &&
		(p1.resources === p2.resources) &&
		(p1.skills === p2.skills) &&

		(R.intersection(p1.objectives, p2.objectives).length === p1.objectives.length) &&
		(p1.objectives.length === p2.objectives.length) &&

		(p1.visibility === p2.visibility);
}


let makeId = module.exports.makeId =
function makeId(type) {
	return [Date.now(), shortid(), type || ''].join('-');
}


let ellipsize = module.exports.ellipsize =
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


const radFactor = Math.PI / 180;
let degToRad = module.exports.degToRad =
function degToRad(deg) {
	return deg * radFactor;
}


let coordsRelativeToElem = module.exports.coordsRelativeToElem =
function coordsRelativeToElem(elem, xy) {
	const $elem = $(elem);
	const elemOffset = $elem.offset();
	return {
		x: xy.x - elemOffset.left,
		y: xy.y - elemOffset.top,
	};
}


// https://code.google.com/p/chromium/issues/detail?id=524432#c3
let getTransformToElement = module.exports.getTransformToElement =
function getTransformToElement(element, target) {
	try {
    	var mTargetInverse = target.getScreenCTM().inverse();
	} catch (e) {
		throw "'target' CTM is not invertible.";
	}
	return mTargetInverse.multiply(element.getScreenCTM());
}


// http://stackoverflow.com/a/6084322/2839801
// http://phrogz.net/svg/drag_under_transformation.xhtml
let unTransform = module.exports.unTransform =
function unTransform(point, ctm) {
	return point.matrixTransform(ctm/*.inverse()*/);
}
let unTransformFromTo = module.exports.unTransformFromTo =
function unTransformFromTo(fromElem, toElem, xy) {
	let point = (fromElem.ownerSVGElement || fromElem).createSVGPoint();
	point.x = xy.x;
	point.y = xy.y;
	// const ctm = fromElem.getTransformToElement(toElem);
	const ctm = getTransformToElement(fromElem, toElem);
	return unTransform(point, ctm);
}

