const React = require('react');
const $ = window.$ = window.jQuery = require('jquery');
require('selectize');


const Selectize = React.createClass({
	propTypes: {
		value: React.PropTypes.string.isRequired,
		options: React.PropTypes.array.isRequired,
		valueAttribute: React.PropTypes.string.isRequired,
		displayAttribute: React.PropTypes.string.isRequired,
		onChange: React.PropTypes.func.isRequired
	},

	onChange: function(values) {
		this.props.onChange(values);
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
			// 		return `<div class="label tag">${escape(item.name)}</div>`;
			// 	}
			// }
		});
		this.selectize = $el[0].selectize;
		this.selectize.setValue(props.value, true);
		this.selectize.open();
		this.update(props.values);
	},

	update: function(value) {
		let that = this;
		this.selectize.clear(true);
		(value || '').split(',')
			.forEach(function(value) {
				that.selectize.addItem(value, true);
			});
	},

	componentWillReceiveProps: function(nextProps) {
		this.update(nextProps.value);
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
