'use strict';

const React = require('react');
const $ = jQuery;


let Selectize = React.createClass({
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
		// let that = this;
		// const props = this.props;
		// props.options.forEach(function(item) {
		// 	that.selectize.addOption(item);
		// });
		// this.selectize.refreshOptions(false);
	},

	componentDidMount: function(select) {
		const props = this.props;
		let $el = $(this.refs['input']);
		$el.selectize({
			delimiter: ',',
			persist: false,
			// hideSelected: true,
			// maxItems: 4, // TODO
			options: props.options,
			valueField: props.valueAttribute,
			labelField: props.displayAttribute,
			searchField: props.displayAttribute,
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
		const props = this.props;
		return (
			<div>
				<input ref='input' className='form-control' /> {/*{...props}*/}
			</div>
		);
	}

});


module.exports = Selectize;
