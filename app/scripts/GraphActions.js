'use strict';

var flummox = require('flummox');
var Actions = flummox.Actions;
var $ = require('jquery');


module.exports =
class GraphActions extends Actions {

	modelAdd(type, data) {
		return {type, data};
	}
};
