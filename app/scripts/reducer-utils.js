'use strict';

const R = require('ramda');
const _ = require('lodash');


const omitType =
module.exports.omitType = R.omit(['type']);

const mergeWith =
module.exports.mergeWith =
function(state, obj) {
	return _.extend({}, state, omitType(obj));
};
