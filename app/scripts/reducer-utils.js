'use strict';

var R = require('ramda');
var _ = require('lodash');


const omitType = R.omit(['type']);

const mergeWith =
module.exports.mergeWith =
function(state, obj) {
	return _.merge({}, state, omitType(obj));
};
