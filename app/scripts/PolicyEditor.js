/* eslint react/no-multi-comp: 0 */
/* eslint react/jsx-boolean-value: 0 */

const React = require('react');
const update = require('react-addons-update');
const R = require('ramda');
const _ = require('lodash');
const SelectizeDropdown = require('./SelectizeDropdown.js');
const RelationSelectize = require('./RelationSelectize.js');
const ComponentReference = require('./ComponentReference.js');
const DividingSpace = require('./DividingSpace.js');


const noop = () => {};

const padding = 25;


const emptyValue = {
	type: 'variable',
};
const emptyCredLocation = undefined;
const emptyCredPredicate = {
	relationType: undefined,
	values: [
		emptyValue,
		emptyValue,
	],
};
const emptyCredData = {
	name: undefined,
	values: [
		// emptyValue,
	],
};
const emptyCredItem = {
	name: undefined,
	values: [
		// _.merge(
		// 	{ type: 'credData' },
		// 	emptyCredData
		// )
	],
};

const empty = {
	'credLocation': emptyCredLocation,
	'credData': emptyCredData,
	'credItem': emptyCredItem,
	'credPredicate': emptyCredPredicate,
};


const actionTypes = [
	'in',
	'out',
	'move',
	'eval',
];


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


const InnerTable = React.createClass({
	propTypes: {
		onRemove: React.PropTypes.func.isRequired,
		noRemove: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			noRemove: false,
		};
	},

	render() {
		const { props } = this;
		const style = {
			background: 'white',
			padding: 5,
			width: '100%',
		};
		const remove = <RemoveButton onRemove={props.onRemove} />;
		return <table style={{ marginBottom: 5 }}>
			<tbody>
				<tr>
					<td style={style}>{props.children}</td>
					<td>{!props.noRemove && remove}</td>
				</tr>
			</tbody>
		</table>;
	}
});


const RemoveButton = React.createClass({
	propTypes: {
		onRemove: React.PropTypes.func.isRequired,
	},

	handleRemove(event) {
		event.preventDefault();
		this.props.onRemove();
	},

	render() {
		return <a
			href='#'
			onClick={this.handleRemove}
			style={{ marginLeft: 5 }}
		>
			<span className='icon fa fa-minus-circle' />
		</a>;
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
		return <strong>*</strong>;
	},
});


const VariableOrSelectize = React.createClass({
	propTypes: {
		data: React.PropTypes.shape({
			type: React.PropTypes.oneOf(['variable', 'value']),
			value: React.PropTypes.string,
		}).isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			data: {},
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

		return <div
			style={{
				display: 'flex',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					flexGrow: 0,
					flexShrink: 0,
					marginRight: '5px',
				}}
			>
				<select
					value={props.data.type}
					onChange={this.typeSelected}
				>
					<option value='variable'>Var</option>
					<option value='value'>Comp</option>
				</select>
			</div>

			<div
				style={{
					flexGrow: 1,
					flexShrink: 1,
				}}
			>
				{(isVariable)
					? variable
					: selectize
				}
			</div>

			{(props.onRemove) &&
				<span> <RemoveButton onRemove={props.onRemove} /></span>
			}
		</div>;
	},
});


const Tuple = React.createClass({
	propTypes: {
		value: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
		};
	},

	_updateArrayIndex(fieldName, index, updatedValue) {
		__updateArrayIndex(
			this.props.onChange,
			this.props.value,
			[fieldName, index, updatedValue]
		);
	},

	valueTypeChanged(newType, index) {
		const { props } = this;
		const updatedValue = updateFieldInObject(
			props.value.values[index],
			'type',
			newType
		);
		const updated = updateArrayIndexInObject(
			props.value,
			'values',
			index,
			updatedValue
		);
		props.onChange(updated);
	},

	render() {
		const props = this.props;
		const types = [
			{ v: 'value', label: 'Value' },
			{ v: 'wildcard', label: 'Wildcard' },
			{ v: 'variable', label: 'Variable' },
			{ v: 'input', label: 'Input' },
			{ v: 'tuple', label: 'Tuple' },
		];

		function getComponent(value) {
			/* eslint brace-style: 0 */
			if (value.type === 'value') {
				return <TextInput
					value={value.value}
					placeholder={value.type}
					onChange={undefined /*this.updateValue*/}
				/>;
			}
			else if (value.type === 'variable') {
				return <TextInput
					value={value.value}
					placeholder={value.type}
					onChange={undefined /*this.updateValue*/}
				/>;
			}
			else if (value.type === 'input') {
				return <TextInput
					value={value.value}
					placeholder={value.type}
					onChange={undefined /*this.updateValue*/}
				/>;
			}
			else if (value.type === 'wildcard') {
				return <Wildcard />;
			}
			else if (value.type === 'tuple') {
				return <Tuple
					value={value}
				/>;
			}
			return null;
		}

		return <div>
			{/*<div>*/}
				{props.value.values
					.map((value, index) => {
						// console.log(value);
						return <div key={index}>
							<select
								value={value.type}
								onChange={(event) => {
									const newType = event.target.value;
									this.valueTypeChanged(newType, index);
								}}
							>
								{types.map((t) => {
									return <option
										key={t.v}
										value={t.v}
									>{t.label}</option>;
								})}
							</select>

							{getComponent(value)}
						</div>;
					})
				}
			{/*</div>*/}
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
			location: React.PropTypes.shape({
				type: React.PropTypes.oneOf(['locvar', 'locval']),
				value: React.PropTypes.string,
			}),
			values: React.PropTypes.array.isRequired,
			logged: React.PropTypes.bool,
		}).isRequired,

		locationOptions: React.PropTypes.array.isRequired,
		nodes: React.PropTypes.object.isRequired,
		nodesList: React.PropTypes.array.isRequired,

		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
			onRemove: noop,
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

	render() {
		const { props } = this;

		const enabled = _.defaults(
			props.enabled,
			{
				location: {
					type: 'locvar',
					value: ''
				},
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

		return <div>
			<div>
				<label style={{ fontWeight: 'normal' }}>
					<input
						type='checkbox'
						checked={enabled.logged}
						onChange={this.handleLoggedChange}
					/>
					<span> logged</span>
				</label>
			</div>

			<div>
				<span>location: </span>
				<VariableOrSelectize
					data={data}
					nodes={props.nodes}
					nodesList={props.nodesList}
					onChange={(updated) => {
						this.handleLocChange(updated);
					}}
				/>
			</div>

			<hr />

			<div>
				{enabled.values
					.map((val, index) => {
						let Component;
						switch (val.type) {
							case 'tuple': {
								Component = Tuple;
								break;
							}

							default: {
								return null;
							}
						}
						return <Component
							key={index}
							value={val}
							onChange={(updatedValue) => {
								this.handleValuesValueChange(updatedValue, index);
							}}
						/>;
					})
				}
			</div>
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
								{actionTypes.map((type) => {
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
						{(isComplexType) && <DividingSpace />}
						{(isComplexType) &&
							<InnerTable
								onRemove={noop}
								noRemove={true}
							>
								{complexTypeEditor}
							</InnerTable>
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
							<a
								href='#'
								onClick={props.addLocation}
							>
								<span className='icon fa fa-plus-circle' />
							</a>
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
							<a
								href='#'
								onClick={props.addPredicate}
							>
								<span className='icon fa fa-plus-circle' />
							</a>
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
							<a
								href='#'
								onClick={props.addData}
							>
								<span className='icon fa fa-plus-circle' />
							</a>
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
							<a
								href='#'
								onClick={props.addItem}
							>
								<span className='icon fa fa-plus-circle' />
							</a>
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
			emptyValue
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
				<label>Value:</label> <a href='#' onClick={this.handleAddValue}><span className='icon fa fa-plus-circle' /></a>
			</div>

			<div>
				{data.values
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
			_.merge({ type }, empty[type])
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

		const style = {
			padding: 5,
			// paddingLeft: padding,
			// border: 'solid 1px black'
		};
		// if (value.type === 'credData') {
			style.backgroundColor = '#ededeb';
		// }

		return <div key={index}>
			<DividingSpace />
			<div style={style}>
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
				<label>Data:</label> <a href='#' onClick={this.handleAddValueData}><span className='icon fa fa-plus-circle' /></a>
			</div>

			<div>
				{item.values.map((it, index) => {
					return this.renderItem(it, index, 'credData');
				})}
			</div>

			<DividingSpace />

			<div>
				<label>Item:</label> <a href='#' onClick={this.handleAddValueItem}><span className='icon fa fa-plus-circle' /></a>
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
				empty[type]
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
