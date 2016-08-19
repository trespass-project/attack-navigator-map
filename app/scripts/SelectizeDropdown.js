const React = require('react');
const R = require('ramda');
const ReactSelectize = require('react-selectize');
const SimpleSelect = ReactSelectize.SimpleSelect;
const MultiSelect = ReactSelectize.MultiSelect;


const SelectizeDropdown = React.createClass({
	propTypes: {
		multi: React.PropTypes.bool,
		name: React.PropTypes.string.isRequired,
		placeholder: React.PropTypes.string,
		value: React.PropTypes.oneOfType([
			React.PropTypes.object,
			React.PropTypes.array,
		]),
		options: React.PropTypes.array,
		onChange: React.PropTypes.func,
		valueKey: React.PropTypes.string,
		labelKey: React.PropTypes.string,
		extraProps: React.PropTypes.object,
	},

	getDefaultProps() {
		return {
			multi: true,
			placeholder: 'select...',
			value: undefined,
			options: [],
			valueKey: 'value',
			labelKey: 'label',
			onChange: (name, value) => {},
			extraProps: {},
		};
	},

	onChange(selectedOption) {
		const props = this.props;
		props.onChange(
			props.name,
			// TODO: maybe have a flag that allows deletion
			(!selectedOption)
				? ''
				: selectedOption.value
		);
	},

	render() {
		const props = this.props;

		const Selectize = (props.multi)
			? MultiSelect
			: SimpleSelect;

		const extraProps = {};
		if (props.value) {
			if (props.multi) {
				extraProps.values = props.value;
				// TODO: renderValue
			} else {
				extraProps.value = props.value;
				extraProps.renderValue = (item) => {
					return <div className='simple-value'>
						{item[props.labelKey]}
					</div>;
				};
			}
		}

		// options need `label` and `value` properties
		const options = props.options
			.map((option) => {
				const omitKeys = [
					props.valueKey,
					props.labelKey,
				];
				return Object.assign(
					{},
					R.omit(omitKeys, option),
					{
						value: option[props.valueKey],
						label: option[props.labelKey] || 'missing label',
					}
				);
			});

		return <Selectize
			theme='bootstrap3'
			placeholder={props.placeholder}
			options={options}
			onValueChange={this.onChange}
			{...extraProps}
			{...props.extraProps}
		/>;
	},
});

module.exports = SelectizeDropdown;
