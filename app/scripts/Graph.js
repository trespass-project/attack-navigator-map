'use strict';

const React = require('react');
const GraphMixin = require('./GraphMixin.js');


const Graph = React.createClass({
	mixins: [GraphMixin],

	getDefaultProps: function() {
		return {
			editable: false,
		};
	},
});


module.exports = Graph;
