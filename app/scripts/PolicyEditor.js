/* eslint react/no-multi-comp: 0 */
/* eslint react/jsx-boolean-value: 0 */

const React = require('react');
const update = require('react-addons-update');
const R = require('ramda');
const _ = require('lodash');
const classnames = require('classnames');
const SelectizeDropdown = require('./SelectizeDropdown.js');
const RelationSelectize = require('./RelationSelectize.js');
const ComponentReference = require('./ComponentReference.js');
const DividingSpace = require('./DividingSpace.js');
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
		{/*<DividingSpace />*/}
		{(value.type !== 'tuple')
			? <InnerTable noRemove>
				<FlexRow
					cell1={select}
					cell2={compo}
					cell3={remove}
				/>
			</InnerTable>
			: <div>{/*style={innerTableContainerStyle}*/}
				<InnerTable
					onRemove={() => handleRemoveValue(index)}
				>
					<div>{select}</div>
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


function addToPolicy(policy, type, data) {
	const updateData = {
		[type]: { $push: [data] },
	};

	return update(
		update(
			policy,
			{
				// set defaults first, before we try to push stuff into it
				credentials: {
					$set: defaultCredentials(policy.credentials)
				}
			}
		),
		{ credentials: updateData }
	);
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
			<div style={innerTableContainerStyle}>
				{(props.value.values || [])
					.map((value, index) => {
						return renderTupleValue(value, index, callbacks);
					})
				}
			</div>
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
				policyCommon.emptyValue /*policyCommon.emptyTuple*/
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
									return renderTupleValue(value, index,callbacks);
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
		const updated = update(
			props.enabled,
			{ action: { $set: event.target.value } }
		);
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


const Credentials = React.createClass({
	propTypes: {
		credentials: React.PropTypes.object.isRequired,
		locationOptions: React.PropTypes.array.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
		addLocation: React.PropTypes.func.isRequired,
		addPredicate: React.PropTypes.func.isRequired,
		addItem: React.PropTypes.func.isRequired,
		addData: React.PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {
			credentials: {},
			locationOptions: [],
			onChange: noop,
		};
	},

	handleChangeCredLocation(index, locationId) {
		this._updateArrayIndex('credLocation', index, locationId);
	},

	handleRemoveCredLocation(index) {
		this._updateField(
			'credLocation',
			R.remove(index, 1, this.props.credentials.credLocation)
		);
	},

	handleChangeCredPredicate(index, updated) {
		this._updateArrayIndex('credPredicate', index, updated);
	},

	handleRemoveCredPredicate(index) {
		this._updateField(
			'credPredicate',
			R.remove(index, 1, this.props.credentials.credPredicate)
		);
	},

	handleChangeCredData(index, updated) {
		this._updateArrayIndex('credData', index, updated);
	},

	handleRemoveCredData(index) {
		this._updateField(
			'credData',
			R.remove(index, 1, this.props.credentials.credData)
		);
	},

	handleChangeCredItem(index, updated) {
		this._updateArrayIndex('credItem', index, updated);
	},

	handleRemoveCredItem(index) {
		this._updateField(
			'credItem',
			R.remove(index, 1, this.props.credentials.credItem)
		);
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.credentials,
			[fieldName, updatedValue]
		);
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.credentials,
			[fieldName, index, updatedValue]
		);
	},

	render() {
		const props = this.props;
		const credLocation = props.credentials.credLocation || [];
		const credPredicate = props.credentials.credPredicate || [];
		const credData = props.credentials.credData || [];
		const credItem = props.credentials.credItem || [];

		return <div>
			<table>
				<tbody>
					{/*LOCATION*/}
					<tr>
						<td colSpan='2'>
							<label>Location:</label>
							<span> </span>
							<AddButton onAdd={props.addLocation} />
						</td>
					</tr>
					<tr>
						<td colSpan='2'>
							{credLocation.map((credLoc, index) => {
								const content = <CredLocation
									locationId={credLoc}
									locationOptions={props.locationOptions}
									nodes={props.nodes}
									onChange={(name, value) => {
										this.handleChangeCredLocation(
											index,
											value
										);
									}}
								/>;
								return <InnerTable
									key={index}
									onRemove={() => {
										this.handleRemoveCredLocation(index);
									}}
								>
									{content}
								</InnerTable>;
							})}
						</td>
					</tr>

					{/*PREDICATE*/}
					<tr>
						<td colSpan='2'>
							<label>Predicate:</label>
							<span> </span>
							<AddButton onAdd={props.addPredicate} />
						</td>
					</tr>
					<tr>
						<td colSpan='2'>
							{credPredicate.map((credPred, index) => {
								const content = <CredPredicate
									predicate={credPred}
									relationTypes={props.relationTypes}
									relationsMap={props.relationsMap}
									nodes={props.nodes}
									nodesList={props.nodesList}
									onChange={(updatedPredicate) => {
										this.handleChangeCredPredicate(
											index,
											updatedPredicate
										);
									}}
								/>;
								return <InnerTable
									key={index}
									onRemove={() => {
										this.handleRemoveCredPredicate(index);
									}}
								>
									{content}
								</InnerTable>;
							})}
						</td>
					</tr>

					{/*DATA*/}
					<tr>
						<td colSpan='2'>
							<label>Data:</label>
							<span> </span>
							<AddButton onAdd={props.addData} />
						</td>
					</tr>
					<tr>
						<td colSpan='2'>
							{credData.map((credData, index) => {
								const content = <CredData
									data={credData}
									nodes={props.nodes}
									nodesList={props.nodesList}
									onChange={(updatedData) => {
										this.handleChangeCredData(
											index,
											updatedData
										);
									}}
								/>;
								return <InnerTable
									key={index}
									onRemove={() => {
										this.handleRemoveCredData(index);
									}}
								>
									{content}
								</InnerTable>;
							})}
						</td>
					</tr>

				{/*ITEM*/}
					<tr>
						<td colSpan='2'>
							<label>Item:</label>
							<span> </span>
							<AddButton onAdd={props.addItem} />
						</td>
					</tr>
					<tr>
						<td colSpan='2'>
							{credItem.map((credItem, index) => {
								const content = <CredItem
									item={credItem}
									nodes={props.nodes}
									nodesList={props.nodesList}
									onChange={(updated) => {
										this.handleChangeCredItem(index, updated);
									}}
								/>;
								return <InnerTable
									key={index}
									onRemove={() => {
										this.handleRemoveCredItem(index);
									}}
								>
									{content}
								</InnerTable>;
							})}
						</td>
					</tr>
				</tbody>
			</table>
		</div>;
	},
});


const CredLocation = React.createClass({
	propTypes: {
		locationId: React.PropTypes.string/*.isRequired*/,
		locationOptions: React.PropTypes.array.isRequired,
		nodes: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			locationOptions: [],
			onChange: noop,
		};
	},

	render() {
		const props = this.props;
		const { locationId } = props;

		const location = {
			value: locationId,
			label: locationId,
		};

		const valueKey = 'value';
		const renderValue = R.partial(
			_renderValue,
			[props.nodes, valueKey]
		);

		return <SelectizeDropdown
			multi={false}
			name='credLocation'
			value={(locationId) ? location : undefined}
			options={props.locationOptions}
			valueKey='value'
			labelKey='label'
			onChange={props.onChange/*(name, values)*/}
			extraProps={{ renderValue }}
		/>;
	},
});


const CredData = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
		};
	},

	handleValueChange(updated, index) {
		this._updateArrayIndex('values', index, updated);
	},

	handleRemoveValue(index) {
		this._updateField(
			'values',
			R.remove(index, 1, this.props.data.values)
		);
	},

	handleAddValue(event) {
		if (event) { event.preventDefault(); }
		const values = [
			...this.props.data.values,
			policyCommon.emptyValue
		];
		this._updateField('values', values);
	},

	handleNameChange(name) {
		this._updateField('name', name);
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.data,
			[fieldName, updatedValue]
		);
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.data,
			[fieldName, index, updatedValue]
		);
	},

	render() {
		const props = this.props;
		const { data } = props;

		return <div>
			<div>
				<TextInput
					value={data.name}
					placeholder='name'
					onChange={this.handleNameChange}
				/>
			</div>

			<DividingSpace />

			<div>
				<label>Value:</label>
				<span> </span>
				<AddButton onAdd={this.handleAddValue} />
			</div>

			<div>
				{(data.values || [])
					.map((value, index) => {
						return <div key={index}>
							<DividingSpace />
							<VariableOrSelectize
								data={value}
								nodes={props.nodes}
								nodesList={props.nodesList}
								onChange={(updated) => {
									this.handleValueChange(updated, index);
								}}
								onRemove={() => {
									this.handleRemoveValue(index);
								}}
							/>
						</div>;
					})
				}
			</div>
		</div>;
	},
});


const CredItem = React.createClass({
	propTypes: {
		item: React.PropTypes.object.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
		};
	},

	handleNameChange(name) {
		this._updateField('name', name);
	},

	handleValueChange(updated, index) {
		this._updateArrayIndex('values', index, updated);
	},

	handleRemoveValue(index) {
		this._updateField(
			'values',
			R.remove(index, 1, this.props.item.values)
		);
	},

	handleAddValueItem(event) {
		if (event) { event.preventDefault(); }
		this._handleAdd('credItem');
	},

	handleAddValueData(event) {
		if (event) { event.preventDefault(); }
		this._handleAdd('credData');
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.item,
			[fieldName, updatedValue]
		);
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.item,
			[fieldName, index, updatedValue]
		);
	},

	_handleAdd(type) {
		const values = [
			...this.props.item.values,
			_.merge({ type }, policyCommon.empty[type])
		];
		this._updateField('values', values);
	},

	renderItem(value, index, type) {
		if (value.type !== type) { return null; }

		const { props } = this;

		const commonProps = {
			nodes: props.nodes,
			nodesList: props.nodesList,
			onChange: (updated) => {
				this.handleValueChange(updated, index);
			},
			onRemove: () => {
				this.handleRemoveValue(index);
			},
		};

		const component = {
			credItem: <CredItem
				item={value}
				{...commonProps}
			/>,
			credData: <CredData
				data={value}
				{...commonProps}
			/>,
		}[value.type] || null;

		return <div key={index}>
			<DividingSpace />
			<div style={innerTableContainerStyle}>
				<InnerTable
					onRemove={() => {
						this.handleRemoveValue(index);
					}}
				>
					{component}
				</InnerTable>
			</div>
		</div>;
	},

	render() {
		const props = this.props;
		const { item } = props;

		return <div>
			<div>
				<TextInput
					value={item.name}
					placeholder='name'
					onChange={this.handleNameChange}
				/>
			</div>

			<DividingSpace />

			<div>
				<label>Data:</label>
				<span> </span>
				<AddButton onAdd={this.handleAddValueData} />
			</div>

			<div>
				{item.values.map((it, index) => {
					return this.renderItem(it, index, 'credData');
				})}
			</div>

			<DividingSpace />

			<div>
				<label>Item:</label>
				<span> </span>
				<AddButton onAdd={this.handleAddValueItem} />
			</div>

			<div>
				{item.values.map((it, index) => {
					return this.renderItem(it, index, 'credItem');
				})}
			</div>
		</div>;
	},
});


const CredPredicate = React.createClass({
	propTypes: {
		predicate: React.PropTypes.object.isRequired,
		relationTypes: React.PropTypes.array.isRequired,
		relationsMap: React.PropTypes.object.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
		};
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.predicate,
			[fieldName, updatedValue]
		);
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.predicate,
			[fieldName, index, updatedValue]
		);
	},

	handleRelationChange(name, relation) {
		this._updateField('relationType', relation);
	},

	handleValueChange(updated, index) {
		this._updateArrayIndex('values', index, updated);
	},

	render() {
		const props = this.props;
		const { predicate } = props;
		const { relationTypes, relationsMap } = props;

		const renderSubjObj = (value, index) => {
			return <VariableOrSelectize
				data={value}
				nodes={props.nodes}
				nodesList={props.nodesList}
				onChange={(updated) => {
					this.handleValueChange(updated, index);
				}}
			/>;
		};

		return <div>
			{renderSubjObj(predicate.values[0], 0)}
			<span> </span>
			<RelationSelectize
				options={relationTypes}
				value={relationsMap[predicate.relationType]}
				onChange={this.handleRelationChange}
			/>
			<span> </span>
			{renderSubjObj(predicate.values[1], 1)}
		</div>;
	},
});


const PolicyEditor = React.createClass({
	propTypes: {
		policy: React.PropTypes.object.isRequired,
		locationOptions: React.PropTypes.array.isRequired,
		relationTypes: React.PropTypes.array.isRequired,
		relationsMap: React.PropTypes.object.isRequired,
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
			addToPolicy(
				this.props.policy,
				type,
				policyCommon.empty[type]
			)
		);
	},

	addLocation(event) {
		this._add(event, 'credLocation');
	},

	addData(event) {
		this._add(event, 'credData');
	},

	addItem(event) {
		this._add(event, 'credItem');
	},

	addPredicate(event) {
		this._add(event, 'credPredicate');
	},

	_updateField(fieldName, updatedValue) {
		__updateField(
			this.props.onChange,
			this.props.policy,
			[fieldName, updatedValue]
		);
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.policy,
			[fieldName, index, updatedValue]
		);
	},

	atLocationsChanged(locationIds) {
		this._updateField('atLocations', locationIds);
	},

	credentialsChanged(credentials) {
		this._updateField('credentials', credentials);
	},

	enabledActionChanged(index, updatedAction) {
		this._updateArrayIndex('enabled', index, updatedAction);
	},

	render() {
		const props = this.props;
		const { policy } = props;

		return <div className='policy'>
			<table>
				<tbody>
					<tr>
						<td>
							<label>Id:</label>
						</td>
						<td>
							{/*<span className='disabled'>{policy.id}</span>*/}
							{policy.id}
						</td>
					</tr>
					<tr>
						<td style={{ verticalAlign: 'middle' }}>
							<label>Locations:</label>
						</td>
						<td>
							<AtLocations
								nodes={props.nodes}
								locations={policy.atLocations}
								locationOptions={props.locationOptions}
								onChange={(name, values) => {
									this.atLocationsChanged(values);
								}}
							/>
						</td>
					</tr>
					<tr>
						<td>
							<label>Action{/*(s)*/}:</label>
						</td>
						<td></td>
					</tr>
					<tr>
						<td colSpan='2' style={{ paddingLeft: padding }}>
							{(policy.enabled || [])
								.map((enabled, index) => {
									return <EnabledAction
										key={index}
										enabled={enabled}
										onChange={(updatedAction) => {
											this.enabledActionChanged(index, updatedAction);
										}}
										locationOptions={props.locationOptions}
										nodes={props.nodes}
										nodesList={props.nodesList}
									/>;
								})
							}
						</td>
					</tr>

					<tr>
						<td colSpan='2'>
							<label>Credentials:</label>
						</td>
					</tr>
					<tr>
						<td colSpan='2' style={{ paddingLeft: padding }}>
							<Credentials
								credentials={policy.credentials}
								locationOptions={props.locationOptions}
								relationTypes={props.relationTypes}
								relationsMap={props.relationsMap}
								nodes={props.nodes}
								nodesList={props.nodesList}
								onChange={this.credentialsChanged}
								addLocation={this.addLocation}
								addPredicate={this.addPredicate}
								addItem={this.addItem}
								addData={this.addData}
							/>
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
				>remove policy</a>
			</div>
		</div>;
	},
});


module.exports = PolicyEditor;
