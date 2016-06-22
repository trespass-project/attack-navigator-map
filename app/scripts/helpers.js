const R = require('ramda');
const $ = require('jquery');
const reactDOM = require('react-dom');
const shortid = require('shortid');
const normalizr = require('normalizr');


const getElemByRef = module.exports.getElemByRef =
function getElemByRef(component, refName) {
	if (refName && component.refs[refName]) {
		return component.refs[refName];
	} else {
		return reactDOM.findDOMNode(component);
	}
};


const noop = module.exports.noop =
function noop() {};


const toHashMap = module.exports.toHashMap =
function toHashMap(key='id', list) {
	return list
		.reduce((acc, item) => {
			acc[item[key]] = item;
			return acc;
		}, {});
};


const normalize = module.exports.normalize =
function normalize(data, idAttribute='id') {
	const name = 'collection';
	const schema = new normalizr.Schema(name, { idAttribute });
	const normalized = normalizr.normalize(
		data,
		normalizr.arrayOf(schema)
	);
	const items = normalized.entities[name];
	const ids = normalized.result;
	return { ids, items };
};


const getItemByKey = module.exports.getItemByKey =
function getItemByKey(key, coll, value) {
	return R.find( R.propEq(key, value) )(coll);
};
const getItemById = module.exports.getItemById = R.partial(getItemByKey, ['id']);


// TODO: test
const getNodesBBox = module.exports.getNodesBBox =
function getNodesBBox(nodes) {
	const bounds = nodes.reduce(
		(_bounds, node) => {
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

	if (nodes.length === 0) {
		bounds.minX = bounds.maxX = bounds.minY = bounds.maxY = 0;
	}

	bounds.x = bounds.minX;
	bounds.y = bounds.minY;
	bounds.width = bounds.maxX - bounds.minX;
	bounds.height = bounds.maxY - bounds.minY;

	return bounds;
};


const getGroupInitialPosition = module.exports.getGroupInitialPosition =
function getGroupInitialPosition(group) {
	return {
		x: group.x || 0,
		y: group.y || 0,
	};
};


// TODO: test
// get bounding box for all nodes in group
const getGroupBBox = module.exports.getGroupBBox =
function getGroupBBox(nodesMap, group) {
	const nodes = group.nodeIds.map(nodeId => nodesMap[nodeId]);
	const bbox = getNodesBBox(nodes);
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
};


const distBetweenPoints = module.exports.distBetweenPoints =
function distBetweenPoints(a, b) {
	const x = b.x - a.x;
	const y = b.y - a.y;
	return Math.sqrt(x * x + y * y);
};


const isBetween = module.exports.isBetween =
function isBetween(what, low, high) {
	return (what >= low) && (what <= high);
};


const isRectInsideRect = module.exports.isRectInsideRect =
function isRectInsideRect(r1, r2) {
	// expects a rect to have: x, y, width, height

	// takes into account the case
	// when r1 (width or height) is bigger than r2,
	// or r1 is completely overlapping r2

	const r1XPlusWidth = r1.x + r1.width;
	const r1YPlusHeight = r1.y + r1.height;
	const r2XPlusWidth = r2.x + r2.width;
	const r2YPlusHeight = r2.y + r2.height;

	const insideX =
		isBetween(r1.x, r2.x, r2XPlusWidth) ||
		isBetween(r1XPlusWidth, r2.x, r2XPlusWidth) ||
		(
			(r1.width > r2.width) &&
			(
				isBetween(r2.x, r1.x, r1XPlusWidth) ||
				isBetween(r2XPlusWidth, r1.x, r1XPlusWidth)
			)
		);
	const insideY =
		isBetween(r1.y, r2.y, r2YPlusHeight) ||
		isBetween(r1YPlusHeight, r2.y, r2YPlusHeight) ||
		(
			(r1.height > r2.height) &&
			(
				isBetween(r2.y, r1.y, r1YPlusHeight) ||
				isBetween(r2YPlusHeight, r1.y, r1YPlusHeight)
			)
		);

	const inside = insideX && insideY;
	return inside;
};


const areAttackerProfilesEqual = module.exports.areAttackerProfilesEqual =
function areAttackerProfilesEqual(p1, p2) {
	// const outcomes1 = (p1.outcomes || []);
	// const outcomes2 = (p2.outcomes || []);
	// const objectives1 = (p1.objectives || []);
	// const objectives2 = (p2.objectives || []);

	// return (p1.intent === p2.intent) &&
	// 	(p1.access === p2.access) &&

	// 	(R.intersection(outcomes1, outcomes2).length === outcomes1.length) &&
	// 	(outcomes1.length === outcomes2.length) &&

	// 	(p1.limit === p2.limit) &&
	// 	(p1.resources === p2.resources) &&
	// 	(p1.skills === p2.skills) &&

	// 	(R.intersection(objectives1, objectives2).length === objectives1.length) &&
	// 	(objectives1.length === objectives2.length) &&

	// 	(p1.visibility === p2.visibility);

	return (p1.budget === p2.budget) &&
		(p1.time === p2.time) &&
		(p1.skill === p2.skill);
};


const makeId = module.exports.makeId =
function makeId(type) {
	return ['id', /*Date.now(),*/ shortid(), type || ''].join('-');
};


const ellipsize = module.exports.ellipsize =
function ellipsize(maxLen, s) {
	const E = '…';
	const len = s.length;
	const diff = maxLen - len;
	if (diff < 0) {
		const centerIndex = len / 2;
		const numDel = Math.abs(diff);
		const startIndex = Math.round(centerIndex - (numDel / 2));
		return s.substring(0, startIndex) + E + s.substring(startIndex + numDel);
	} else {
		return s;
	}
};


const radFactor = Math.PI / 180;
const degToRad = module.exports.degToRad =
function degToRad(deg) {
	return deg * radFactor;
};


const coordsRelativeToElem = module.exports.coordsRelativeToElem =
function coordsRelativeToElem(elem, xy) {
	const $elem = $(elem);
	const elemOffset = $elem.offset();
	return {
		x: xy.x - elemOffset.left,
		y: xy.y - elemOffset.top,
	};
};


// https://code.google.com/p/chromium/issues/detail?id=524432#c3
const getTransformToElement = module.exports.getTransformToElement =
function getTransformToElement(element, target) {
	try {
		const mTargetInverse = target.getScreenCTM().inverse();
		return mTargetInverse.multiply(element.getScreenCTM());
	} catch (e) {
		throw new Error("'target' CTM is not invertible.");
	}
};


// http://stackoverflow.com/a/6084322/2839801
// http://phrogz.net/svg/drag_under_transformation.xhtml
const unTransform = module.exports.unTransform =
function unTransform(point, ctm) {
	return point.matrixTransform(ctm/*.inverse()*/);
};


const unTransformFromTo = module.exports.unTransformFromTo =
function unTransformFromTo(fromElem, toElem, xy) {
	const point = (fromElem.ownerSVGElement || fromElem).createSVGPoint();
	point.x = xy.x;
	point.y = xy.y;
	// const ctm = fromElem.getTransformToElement(toElem);
	const ctm = getTransformToElement(fromElem, toElem);
	return unTransform(point, ctm);
};


const handleStatus =
module.exports.handleStatus =
function handleStatus(taskStatusData) {
	const completed = R.takeWhile(
		item => (item.status === 'done'),
		taskStatusData.tool_status
	);
	const notCompleted = R.dropWhile(
		item => (item.status === 'done'),
		taskStatusData.tool_status
	);
	const current = R.filter(
		item => (item.status !== 'not started'),
		notCompleted
	);
	const pending = R.dropWhile(
		item => (item.status !== 'not started'),
		notCompleted
	);

	return { completed, current, pending };
};


const replaceIdsInString =
module.exports.replaceIdsInString =
function replaceIdsInString(str, idReplacementMap={}) {
	const substituteCounter = {};
	return R.keys(idReplacementMap)
		.reduce((acc, oldId) => {
			const re = new RegExp(oldId, 'g');
			const substitute = idReplacementMap[oldId];
			if (!substituteCounter[substitute]) {
				substituteCounter[substitute] = 1;
			} else {
				substituteCounter[substitute]++;
			}

			// if same substitute is used more than once,
			// this ensures results are still unique
			const suffix = (substituteCounter[substitute] > 1)
				? `-${substituteCounter[substitute]}`
				: '';

			return acc.replace(re, `${substitute}${suffix}`);
		}, str);
};


const makeHumanReadable =
module.exports.makeHumanReadable =
function makeHumanReadable(item) {
	return `${item.modelComponentType}__${(item.label || item.id).replace(/ +/g, '-')}`;
};
