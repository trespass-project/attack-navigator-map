'use strict';

let React = require('react');
let GraphMixin = require('./GraphMixin.js');


var Graph = React.createClass({
	mixins: [GraphMixin],

	getDefaultProps: function() {
		return {
			editable: false,
		};
	},
});


module.exports = Graph;
