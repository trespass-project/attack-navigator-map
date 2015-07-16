'use strict';

var React = require('react');
var _ = require('lodash');
var R = require('ramda');
var mout = require('mout');
var $ = require('jquery');
var flummox = require('flummox');
var Flux = flummox.Flux;

var constants = require('./constants.js');

var LibraryActions = require('./components/Library/LibraryActions.js');
var LibraryStore = require('./components/Library/LibraryStore.js');

var App = require('./components/App/App.js');
var AppActions = require('./components/App/AppActions.js');
var AppStore = require('./components/App/AppStore.js');


class AppFlux extends Flux {

	constructor() {
		super();

		this.createActions(constants.APP, AppActions);
		this.createStore(constants.APP, AppStore, this, constants.APP);

		this.createActions(constants.LOCATION_LIBRARY, LibraryActions);
		this.createStore(constants.LOCATION_LIBRARY, LibraryStore, this, constants.LOCATION_LIBRARY);

		this.createActions(constants.MODEL_LIBRARY, LibraryActions);
		this.createStore(constants.MODEL_LIBRARY, LibraryStore, this, constants.MODEL_LIBRARY);
	}

}

const flux = new AppFlux();

React.render(
	<App flux={flux}></App>,
	$('#app')[0]
);
