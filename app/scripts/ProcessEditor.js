/* eslint react/no-multi-comp: 0 */
/* eslint react/jsx-boolean-value: 0 */

const React = require('react');
const update = require('react-addons-update');
const R = require('ramda');
const _ = require('lodash');
const classnames = require('classnames');
const SelectizeDropdown = require('./SelectizeDropdown.js');
// const RelationSelectize = require('./RelationSelectize.js');
const ComponentReference = require('./ComponentReference.js');
const DividingSpace = require('./DividingSpace.js');
const processCommon = require('./processCommon.js');
const policyCommon = require('./policyCommon.js');


const noop = () => {};

const padding = 25;

const innerTableContainerStyle = {
	padding: 5,
	backgroundColor: '#ededeb',
};


const getComponent = (value, index, { valueValueChanged, tupleChanged }) => {
	const handleChange = (newValue) => {
		valueValueChanged(
			newValue,
			index
		);
	};

	/* eslint brace-style: 0 */
	if (value.type === 'value') {
		return <TextInput
			value={value.value}
			placeholder={value.type}
			onChange={handleChange}
		/>;
	}
	else if (value.type === 'variable') {
		return <TextInput
			value={value.value}
			placeholder={value.type}
			onChange={handleChange}
		/>;
	}
	else if (value.type === 'input') {
		return <TextInput
			value={value.value}
			placeholder={value.type}
			onChange={handleChange}
		/>;
	}
	else if (value.type === 'wildcard') {
		return <Wildcard />;
	}
	else if (value.type === 'tuple') {
		return <Tuple
			value={value}
			onChange={(updatedTuple) => {
				tupleChanged(updatedTuple, index);
			}}
		/>;
	}
	return null;
};

function renderTupleValue(value, index, {
		valueTypeChanged,
		handleRemoveValue,
		valueValueChanged,
		tupleChanged
	}) {
	const select = <select
		value={value.type}
		onChange={(event) => {
			valueTypeChanged(
				event.target.value,
				index
			);
		}}
	>
		{policyCommon.tupleValueTypes.map((t) => {
			return <option key={t.v} value={t.v}>
				{t.label}
			</option>;
		})}
	</select>;

	const remove = <RemoveButton
		onRemove={() => {
			handleRemoveValue(index);
		}}
	/>;

	const compo = getComponent(
		value, index,
		{ valueValueChanged, tupleChanged }
	);

	return <div key={index}>
		{(value.type !== 'tuple')
			? <InnerTable noRemove>
				<FlexRow
					cell1={select}
					cell2={compo}
					cell3={remove}
				/>
			</InnerTable>
			: <div>
				<InnerTable
					onRemove={() => handleRemoveValue(index)}
				>
					<div>{select}</div>
					<DividingSpace />
					{compo}
				</InnerTable>
			</div>
		}
	</div>;
}


function sanitizeValue(prevValue, updatedValue) {
	/* eslint no-param-reassign: 0 */
	// if case changed, reset `value` to s.th. sane
	if (prevValue.type !== updatedValue.type) {
		switch (updatedValue.type) {
			case 'value':
			case 'variable':
			case 'input': {
				const previousWasSimilar = R.contains(
					prevValue.type,
					['value', 'variable', 'input']
				);
				if (previousWasSimilar) {
					updatedValue.value = prevValue.value;
				} else {
					delete updatedValue.value;
				}
				break;
			}

			case 'tuple': {
				delete updatedValue.value;
				updatedValue.values = [];
				break;
			}

			case 'wildcard': {
				delete updatedValue.value;
				break;
			}

			default:
				break;
		}
	}

	return updatedValue;
}


function updateFieldInObject(obj, fieldName, updatedValue) {
	return update(
		obj,
		{ [fieldName]: { $set: updatedValue } }
	);
}


function updateArrayIndexInObject(obj, fieldName, index, updatedValue) {
	return update(
		obj,
		{
			[fieldName]: {
				[index]: { $set: updatedValue }
			}
		}
	);
}


function __updateField(onChange, obj, params) {
	onChange(
		updateFieldInObject(
			obj,
			...params
		)
	);
}


function __updateArrayIndex(onChange, obj, params) {
	onChange(
		updateArrayIndexInObject(
			obj,
			...params
		)
	);
}


function defaultCredentials(credentials) {
	return _.defaults(
		credentials,
		{
			credLocation: [],
			credData: [],
			credItem: [],
			credPredicate: [],
		}
	);
}


function addToProcess(process, type, data) {
	const updateData = {
		[type]: { $push: [data] },
	};

	return update(process, updateData);
}


function _renderValue(nodes, valueKey='value', item) {
	const node = nodes[item[valueKey]];
	return (!node)
		? null
		: <ComponentReference
			modelComponent={node}
		>{node.label}</ComponentReference>;
}


const FlexRow = React.createClass({
	propTypes: {
		cell1: React.PropTypes.any.isRequired,
		cell2: React.PropTypes.any.isRequired,
		cell3: React.PropTypes.any,
	},

	render() {
		const { props } = this;
		const containerStyle = {
			display: 'flex',
			alignItems: 'center',
		};
		const cell1Style = {
			flexGrow: 0,
			flexShrink: 0,
			marginRight: '5px',
		};
		const cell2Style = {
			flexGrow: 1,
			flexShrink: 1,
		};
		return <div style={containerStyle}>
			<div style={cell1Style}>
				{props.cell1}
			</div>
			<div style={cell2Style}>
				{props.cell2}
			</div>
			{(!!props.cell3) &&
				<span> {props.cell3}</span>
			}
		</div>;
	},
});


const InnerTable = React.createClass({
	propTypes: {
		onRemove: React.PropTypes.func,
		noRemove: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			onRemove: noop,
			noRemove: false,
		};
	},

	render() {
		const { props } = this;
		const tableStyle = {
			marginBottom: 5
		};
		const style = {
			background: 'white',
			padding: 5,
			width: '100%',
		};

		return <table style={tableStyle} className='inner'>
			<tbody>
				<tr>
					<td style={style}>
						{props.children}
					</td>
					<td>
						{!props.noRemove &&
							<RemoveButton onRemove={props.onRemove} />
						}
					</td>
				</tr>
			</tbody>
		</table>;
	}
});


const IconButton = React.createClass({
	propTypes: {
		onClick: React.PropTypes.func.isRequired,
		icon: React.PropTypes.string.isRequired,
	},

	render() {
		const classes = classnames(
			'icon', 'fa', this.props.icon
		);
		return <a
			href='#'
			onClick={(event) => {
				event.preventDefault();
				this.props.onClick();
			}}
			style={{ marginLeft: 5 }}
		><span className={classes} /></a>;
	}
});


const RemoveButton = React.createClass({
	propTypes: {
		onRemove: React.PropTypes.func.isRequired,
	},

	render() {
		return <IconButton
			icon='fa-minus-circle'
			onClick={this.props.onRemove}
		/>;
	}
});


const AddButton = React.createClass({
	propTypes: {
		onAdd: React.PropTypes.func.isRequired,
	},

	render() {
		return <IconButton
			icon='fa-plus-circle'
			onClick={this.props.onAdd}
		/>;
	}
});


const TextInput = React.createClass({
	propTypes: {
		value: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired,
	},

	render() {
		const { props } = this;

		return <input
			className='form-control'
			type='text'
			value={props.value || ''}
			placeholder={props.placeholder || ''}
			onChange={(event) => {
				props.onChange(event.target.value);
			}}
		/>;
	}
});


const Wildcard = React.createClass({
	render() {
		return <strong>✱</strong>;
	},
});


const VariableOrSelectize = React.createClass({
	propTypes: {
		data: React.PropTypes.shape({
			type: React.PropTypes.oneOf(['variable', 'value']),
			value: React.PropTypes.string,
		}).isRequired,
		variableLabel: React.PropTypes.string,
		selectizeLabel: React.PropTypes.string,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			data: {},
			variableLabel: 'Variable',
			selectizeLabel: 'Component',
			onChange: noop,
			nodes: {},
		};
	},

	toggleType(event) {
		// if (event) { event.preventDefault(); }
		const newType = (this.props.data.type === 'variable')
			? 'value'
			: 'variable';
		this._updateField('type', newType);
	},

	typeSelected(event) {
		// if (event) { event.preventDefault(); }
		const newType = event.target.value;
		this._updateField('type', newType);
	},

	updateValue(newVal) {
		this._updateField('value', newVal);
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.data,
			[fieldName, updatedValue]
		);
	},

	render() {
		const props = this.props;
		const isVariable = (props.data.type === 'variable');

		const valueKey = 'id';
		const renderValue = R.partial(
			_renderValue,
			[props.nodes, valueKey]
		);

		const variable = <TextInput
			value={props.data.value}
			placeholder='variable name'
			onChange={this.updateValue}
		/>;

		const selectize = <SelectizeDropdown
			multi={false}
			name='nodes'
			value={props.nodes[props.data.value]}
			options={props.nodesList}
			valueKey={valueKey}
			labelKey='label'
			onChange={(name, value) => {
				this.updateValue(value);
			}}
			extraProps={{ renderValue }}
		/>;

		return <FlexRow
			cell1={
				<select
					value={props.data.type}
					onChange={this.typeSelected}
				>
					<option value='variable'>{props.variableLabel}</option>
					<option value='value'>{props.selectizeLabel}</option>
				</select>
			}
			cell2={
				(isVariable) ? variable : selectize
			}
			cell3={
				(props.onRemove) &&
					<RemoveButton onRemove={props.onRemove} />
			}
		/>;
	},
});


const Tuple = React.createClass({
	propTypes: {
		value: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
			onRemove: noop,
		};
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.value,
			[fieldName, index, updatedValue]
		);
	},

	valueHandleFieldChange(fieldName, updated, index) {
		const { props } = this;
		const prevValue = props.value.values[index];
		const updatedValue = Object.assign(
			{},
			prevValue,
			{ [fieldName]: updated }
		);

		this._updateArrayIndex(
			'values',
			index,
			sanitizeValue(prevValue, updatedValue)
		);
	},

	valueTypeChanged(newType, index) {
		this.valueHandleFieldChange('type', newType, index);
	},

	valueValueChanged(newValue, index) {
		this.valueHandleFieldChange('value', newValue, index);
	},

	tupleChanged(updatedTuple, index) {
		this._updateArrayIndex(
			'values',
			index,
			updatedTuple
		);
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.value,
			[fieldName, updatedValue]
		);
	},

	handleRemoveValue(index) {
		this._updateField(
			'values',
			R.remove(index, 1, this.props.value.values)
		);
	},

	addValue() {
		const updatedValues = update(
			this.props.value.values,
			{ $push: [policyCommon.emptyVariable] }
		);
		this._updateField(
			'values',
			updatedValues
		);
	},

	render() {
		const props = this.props;
		const callbacks = R.pick(
			[
				'valueTypeChanged',
				'handleRemoveValue',
				'valueValueChanged',
				'tupleChanged',
			],
			this
		);

		return <div>
			{(props.value.values && props.value.values.length)
				? <div style={innerTableContainerStyle}>
					{(props.value.values)
						.map((value, index) => {
							return renderTupleValue(value, index, callbacks);
						})
					}
				</div>
				: null
			}
			<div>
				<AddButton onAdd={this.addValue} />
			</div>
		</div>;
	},
});


const AtLocations = React.createClass({
	propTypes: {
		locations: React.PropTypes.array.isRequired,
		locationOptions: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
		nodes: React.PropTypes.object.isRequired,
	},

	getDefaultProps() {
		return {
			locations: [],
			locationOptions: [],
			onChange: noop,
			nodes: {},
		};
	},

	render() {
		const props = this.props;
		const locations = props.locations
			.map((locationId) => {
				return {
					value: locationId,
					label: locationId,
				};
			});

		const valueKey = 'value';
		const renderValue = R.partial(
			_renderValue,
			[props.nodes, valueKey]
		);

		return <div>
			<div>
				<SelectizeDropdown
					multi={true}
					name='locations'
					value={locations}
					options={props.locationOptions}
					valueKey='value'
					labelKey='label'
					onChange={props.onChange/*(name, values)*/}
					extraProps={{ renderValue }}
				/>
			</div>
		</div>;
	},
});


const InOutType = React.createClass({
	propTypes: {
		enabled: React.PropTypes.shape({
			action: React.PropTypes.string.isRequired,
			logged: React.PropTypes.bool,
			location: React.PropTypes.shape({
				type: React.PropTypes.oneOf(['locvar', 'locval']),
				value: React.PropTypes.string,
			}),
			values: React.PropTypes.array/*.isRequired*/,
		}).isRequired,

		locationOptions: React.PropTypes.array.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,

		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
		};
	},

	handleLocChange({ type, value }) {
		const typeMap = {
			'variable': 'locvar',
			'value': 'locval',
		};
		const updatedLocation = {
			type: typeMap[type],
			value,
		};
		this._updateField(
			'location',
			updatedLocation
		);
	},

	handleLoggedChange(event) {
		// event.preventDefault();
		this._updateField(
			'logged',
			event.target.checked
		);
	},

	handleValuesValueChange(updatedValue, index) {
		this._updateArrayIndex('values', index, updatedValue);
	},

	handleRemoveValue(index) {
		this._updateField(
			'values',
			R.remove(index, 1, this.props.enabled.values)
		);
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.enabled,
			[fieldName, updatedValue]
		);
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.enabled,
			[fieldName, index, updatedValue]
		);
	},

	addValue() {
		this._updateField(
			'values',
			[
				...this.props.enabled.values,
				policyCommon.emptyValue
			]
		);
	},

	valueHandleFieldChange(fieldName, updated, index) {
		const { props } = this;
		const prevValue = props.enabled.values[index];
		const updatedValue = Object.assign(
			{},
			prevValue,
			{ [fieldName]: updated }
		);

		this._updateArrayIndex(
			'values',
			index,
			sanitizeValue(prevValue, updatedValue)
		);
	},

	valueTypeChanged(newType, index) {
		this.valueHandleFieldChange('type', newType, index);
	},

	valueValueChanged(newValue, index) {
		this.valueHandleFieldChange('value', newValue, index);
	},

	tupleChanged(updatedTuple, index) {
		this._updateArrayIndex(
			'values',
			index,
			updatedTuple
		);
	},

	render() {
		const { props } = this;

		const enabled = _.defaults(
			props.enabled,
			{
				location: policyCommon.emptyLocVar,
				values: [],
				logged: false,
			}
		);

		const data = {
			type: (enabled.location.type === 'locvar')
				? 'variable'
				: 'value',
			value: enabled.location.value,
		};

		const callbacks = R.pick(
			[
				'valueTypeChanged',
				'handleRemoveValue',
				'valueValueChanged',
				'tupleChanged',
			],
			this
		);

		return <div>
			<table>
				<tbody>

					<tr>
						<td colSpan='2'>
							<label style={{ fontWeight: 'normal' }}>
								<input
									type='checkbox'
									checked={enabled.logged}
									onChange={this.handleLoggedChange}
								/>
								<span> is logged</span>
							</label>
						</td>
					</tr>

					<tr>
						<td>
							<VariableOrSelectize
								data={data}
								variableLabel='Loc. variable'
								selectizeLabel='Loc. component'
								nodes={props.nodes}
								nodesList={props.nodesList}
								onChange={(updated) => {
									this.handleLocChange(updated);
								}}
							/>
						</td>
					</tr>

					<tr>
						<td>
							{(enabled.values.length > 0) &&
								<DividingSpace />
							}

							{(enabled.values || [])
								.map((value, index) => {
									return renderTupleValue(value, index, callbacks);
								})
							}
						</td>
					</tr>

					<tr>
						<td>
							<AddButton onAdd={this.addValue} />
						</td>
					</tr>

				</tbody>
			</table>
		</div>;
	},
});


const EnabledAction = React.createClass({
	propTypes: {
		enabled: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,

		locationOptions: React.PropTypes.array.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
	},

	getDefaultProps() {
		return {
			onChange: noop,
		};
	},

	changeActionType(event) {
		const { props } = this;
		const newType = event.target.value;
		let updated = update(
			props.enabled,
			{ action: { $set: newType } }
		);

		if (R.contains(newType, policyCommon.actionTypesSimple)) {
			// simple types only have the action field
			updated = R.pick(['action'], updated);
		}

		props.onChange(updated);
	},

	handleEnabledChange(updatedEnabled) {
		// { location, values, logged }
		const { props } = this;
		const updated = Object.assign(
			{},
			props.enabled,
			updatedEnabled
		);
		props.onChange(updated);
	},

	render() {
		const { props } = this;
		const { enabled } = props;

		const isComplexType = R.contains(enabled.action, ['in', 'out']);
		const complexTypeEditor = (isComplexType)
			? <InOutType
				enabled={enabled}
				locationOptions={props.locationOptions}
				nodes={props.nodes}
				nodesList={props.nodesList}
				onChange={this.handleEnabledChange}
			/>
			: null;

		return <div>
			<table>
				<tbody>
					<tr>
						<td colSpan='2'>
							<label>Type:</label>
							<span> </span>
							<select
								onChange={this.changeActionType}
								value={enabled.action || ''}
							>
								<option key={''} value={''} disabled>
									select
								</option>
								{policyCommon.actionTypes.map((type) => {
									return <option
										key={type}
										value={type}
									>{type}</option>;
								})}
							</select>
						</td>
					</tr>

					<tr>
						<td colSpan='2'>
						{(isComplexType) &&
							<DividingSpace />
						}
						{(isComplexType) &&
							complexTypeEditor
						}
						</td>
					</tr>
				</tbody>
			</table>
		</div>;
	},
});


const ProcessEditor = React.createClass({
	propTypes: {
		process: React.PropTypes.object.isRequired,
		locationOptions: React.PropTypes.array.isRequired,
		// relationTypes: React.PropTypes.array.isRequired,
		// relationsMap: React.PropTypes.object.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
			onRemove: noop,
			nodes: {},
			locationOptions: [],
		};
	},

	_add(event, type) {
		if (event) { event.preventDefault(); }
		this.props.onChange(
			addToProcess(
				this.props.process,
				type,
				processCommon.empty[type]
			)
		);
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.process,
			[fieldName, updatedValue]
		);
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.process,
			[fieldName, index, updatedValue]
		);
	},

	addAction(event) {
		this._add(event, 'actions');
	},

	atLocationsChanged(locationIds) {
		this._updateField('atLocations', locationIds);
	},

	actionChanged(index, updatedAction) {
		this._updateArrayIndex('actions', index, updatedAction);
	},

	removeAction(index) {
		this._updateField(
			'actions',
			R.remove(index, 1, this.props.process.actions)
		);
	},

	render() {
		const props = this.props;
		const { process } = props;

		return <div className='process'>
			<table>
				<tbody>
					<tr>
						<td>
							<label>Id:</label>
						</td>
						<td>
							{process.id}
						</td>
					</tr>
					<tr>
						<td style={{ verticalAlign: 'middle' }}>
							<label>Locations:</label>
						</td>
						<td>
							<AtLocations
								nodes={props.nodes}
								locations={process.atLocations}
								locationOptions={props.locationOptions}
								onChange={(name, values) => {
									this.atLocationsChanged(values);
								}}
							/>
						</td>
					</tr>
					<tr>
						{/*<td>
							<label>Actions:</label>
						</td>
						<td></td>*/}
						<td colSpan='2'>
							<label>Actions:</label>
							<span> </span>
							<AddButton onAdd={this.addAction} />
						</td>
					</tr>
					<tr>
						<td colSpan='2' style={{ paddingLeft: padding }}>
							{(process.actions || [])
								.map((action, index) => {
									const a = <EnabledAction
										key={index}
										enabled={action}
										onChange={(updatedAction) => {
											this.actionChanged(index, updatedAction);
										}}
										locationOptions={props.locationOptions}
										nodes={props.nodes}
										nodesList={props.nodesList}
									/>;

									return <InnerTable
										key={index}
										onRemove={() => this.removeAction(index)}
									>
										{a}
									</InnerTable>;
								})
							}
						</td>
					</tr>
				</tbody>
			</table>

			<div>
				<a
					href='#'
					onClick={(event) => {
						event.preventDefault();
						props.onRemove();
					}}
				>remove process</a>
			</div>
		</div>;
	},
});


module.exports = ProcessEditor;
