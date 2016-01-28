'use strict';

var React = require('react');
var $ = jQuery;


var Selectize = React.createClass({
	propTypes: {
		options: React.PropTypes.array.isRequired,
		valueAttribute: React.PropTypes.string.isRequired,
		displayAttribute: React.PropTypes.string.isRequired,
		onChange: React.PropTypes.func.isRequired
	},

	onChange: function(values) {
		this.props.onChange(values);
	},

	componentDidUpdate: function() {
		this.update();
	},

	update: function() {
		var that = this;
		// this.props.options.forEach(function(item) {
		// 	that.selectize.addOption(item);
		// });
		// this.selectize.refreshOptions(false);
	},

	componentDidMount: function(select) {
		var $el = $(this.refs['input']);
		$el.selectize({
			delimiter: ',',
			persist: false,
			// hideSelected: true,
			// maxItems: 4, // TODO
			options: this.props.options,
			valueField: this.props.valueAttribute,
			labelField: this.props.displayAttribute,
			searchField: this.props.displayAttribute,
			onChange: this.onChange,
			// render: {
			// 	option: function(item, escape) {
			// 		return '<div class="label tag">'+escape(item.name)+'</div>';
			// 	}
			// }
		});
		this.selectize = $el[0].selectize;
		this.selectize.open();
		this.update();
	},

	render: function() {
		return (
			<div>
				<input ref='input' className='form-control' {...this.props} />
			</div>
		);
	}

});


module.exports = Selectize;
