/* eslint react/no-multi-comp: 0 */

const React = require('react');
const update = require('react-addons-update');
const R = require('ramda');
const _ = require('lodash');
const SelectizeDropdown = require('./SelectizeDropdown.js');
const RelationSelectize = require('./RelationSelectize.js');
const ComponentReference = require('./ComponentReference.js');


const noop = () => {};


const emptyCredLocation = {
	id: undefined
};
const emptyCredPredicate = {
	relationType: undefined,
	values: [
		{ type: 'variable' },
		{ type: 'variable' },
	],
};
const emptyCredData = {
	name: undefined,
	values: [
		{ type: 'variable' },
	],
};
const emptyCredItem = {
	name: undefined,
	values: [
		_.merge(
			{ type: 'credData' },
			emptyCredData
		)
	],
};


const actionTypes = [
	'in',
	'out',
	'move',
	'eval',
];


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


function _add(type, policy, data) {
	const updateData = {
		[type]: { $push: [data] },
	};

	return update(
		update(
			policy,
			{
				// set defaults first, before we try to push stuff into it
				credentials: { $set: defaultCredentials(policy.credentials) }
			}
		),
		{
			credentials: updateData,
		}
	);
}


const VariableOrSelectize = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
		nodes: React.PropTypes.object.isRequired,
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
		const { props } = this;
		const updated = (props.data.type === 'variable')
			? update(props.data, { type: { $set: 'value' } })
			: update(props.data, { type: { $set: 'variable' } });
		props.onChange(updated);
	},

	updateValue(newVal) {
		const { props } = this;
		const updated = update(
			props.data,
			{ value: { $set: newVal } }
		);
		props.onChange(updated);
	},

	render() {
		const props = this.props;
		const isVariable = (props.data.type === 'variable');

		const valueKey = 'id';
		// TODO: DRY
		const renderValue = (item) => {
			const node = props.nodes[item[valueKey]];
			if (!node) { return null; }
			return <ComponentReference modelComponent={node}>
				{node.label}
			</ComponentReference>;
		};

		const variable = <span>
			<input
				type='text'
				value={props.data.value || ''}
				onChange={(event) => {
					const newVal = event.target.value;
					this.updateValue(newVal);
				}}
			/>
		</span>;
		const selectize = <SelectizeDropdown
			multi={false}
			name='nodes'
			value={props.nodes[props.data.value]}
			options={R.values(props.nodes)}
			valueKey={valueKey}
			labelKey='label'
			onChange={(name, value) => {
				this.updateValue(value);
			}}
			extraProps={{ renderValue }}
		/>;

		return <div>
			<input
				type='checkbox'
				checked={isVariable}
				onChange={this.toggleType}
			/>
			<span> is variable </span>
			{(isVariable)
				? variable
				: selectize
			}
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

		// TODO: DRY
		const renderValue = (item) => {
			const node = props.nodes[item[/*valueKey*/ 'value']];
			if (!node) { return null; }
			return <ComponentReference modelComponent={node}>
				{node.label}
			</ComponentReference>;
		};

		return <div>
			<div><b>at locations</b></div>
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


const EnabledAction = React.createClass({
	propTypes: {
		action: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			action: {},
			onChange: noop,
		};
	},

	getType() {
		// should only have a single field
		const actionType = R.keys(this.props.action)[0];
		return actionType;
	},

	changeActionType(event) {
		const type = event.target.value;
		const { props } = this;
		const { action } = props;
		const newAction = {
			[type]: action[this.getType()]
		};
		props.onChange(newAction);
	},

	render() {
		const { props } = this;
		const actionType = this.getType();

		return <div>
			<div>
				<b>enabled action</b>
			</div>
			<div>
				<select
					value={actionType}
					onChange={this.changeActionType}
				>
					{actionTypes.map((type) => {
						return <option
							key={type}
							value={type}
						>{type}</option>;
					})}
				</select>
			</div>
		</div>;
	},
});


const Credentials = React.createClass({
	propTypes: {
		credentials: React.PropTypes.object.isRequired,
		locationOptions: React.PropTypes.array.isRequired,
		nodes: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			credentials: {},
			locationOptions: [],
			onChange: noop,
		};
	},

	handleChangeCredLocation(index, locationId) {
		const { credentials, onChange } = this.props;
		const updatedCredentials = update(
			credentials,
			{
				credLocation: {
					[index]: {
						id: { $set: locationId }
					}
				}
			}
		);
		onChange(updatedCredentials);
	},

	handleRemoveCredLocation(index) {
		const { credentials, onChange } = this.props;
		const updatedCredentials = Object.assign(
			{},
			credentials,
			{
				credLocation: R.remove(index, 1, credentials.credLocation)
			}
		);
		onChange(updatedCredentials);
	},

	handleChangeCredPredicate(index, updatedPredicate) {
		const { credentials, onChange } = this.props;
		const updatedCredentials = update(
			credentials,
			{
				credPredicate: {
					[index]: { $set: updatedPredicate }
				}
			}
		);
		onChange(updatedCredentials);
	},

	handleRemoveCredPredicate(index) {
		const { credentials, onChange } = this.props;
		const updatedCredentials = Object.assign(
			{},
			credentials,
			{
				credPredicate: R.remove(index, 1, credentials.credPredicate)
			}
		);
		onChange(updatedCredentials);
	},

	handleChangeCredData(index, updatedData) {
		const { credentials, onChange } = this.props;
		const updatedCredentials = update(
			credentials,
			{
				credData: {
					[index]: { $set: updatedData }
				}
			}
		);
		onChange(updatedCredentials);
	},

	handleRemoveCredData(index) {
		const { credentials, onChange } = this.props;
		const updatedCredentials = Object.assign(
			{},
			credentials,
			{
				credData: R.remove(index, 1, credentials.credData)
			}
		);
		onChange(updatedCredentials);
	},

	handleRemoveCredItem(index) {
		const { credentials, onChange } = this.props;
		const updatedCredentials = Object.assign(
			{},
			credentials,
			{
				credItem: R.remove(index, 1, credentials.credItem)
			}
		);
		onChange(updatedCredentials);
	},

	render() {
		const props = this.props;
		const credLocation = props.credentials.credLocation || [];
		const credPredicate = props.credentials.credPredicate || [];
		const credData = props.credentials.credData || [];
		const credItem = props.credentials.credItem || [];

		return <div>
			<div><b>credentials</b></div>

			<div>
				<div>cred. locations</div>
				<div style={{ background: 'rgb(245, 245, 245)' }}>
					{credLocation.map((credLoc, index) => {
						return <CredLocation
							key={index}
							locationId={credLoc.id}
							locationOptions={props.locationOptions}
							nodes={props.nodes}
							onChange={(name, value) => {
								this.handleChangeCredLocation(
									index,
									value
								);
							}}
							onRemove={() => {
								this.handleRemoveCredLocation(index);
							}}
						/>;
					})}
				</div>
			</div>

			<div>
				<div>cred. predicates</div>
				<div style={{ background: 'rgb(245, 245, 245)' }}>
					{credPredicate.map((credPred, index) => {
						return <CredPredicate
							key={index}
							predicate={credPred}
							relationTypes={props.relationTypes}
							relationsMap={props.relationsMap}
							nodes={props.nodes}
							onChange={(updatedPredicate) => {
								this.handleChangeCredPredicate(
									index,
									updatedPredicate
								);
							}}
							onRemove={() => {
								this.handleRemoveCredPredicate(index);
							}}
						/>;
					})}
				</div>
			</div>

			<div>
				<div>cred. data</div>
				<div style={{ background: 'rgb(245, 245, 245)' }}>
					{credData.map((credData, index) => {
						return <CredData
							key={index}
							data={credData}
							nodes={props.nodes}
							onChange={(updatedData) => {
								this.handleChangeCredData(
									index,
									updatedData
								);
							}}
							onRemove={() => {
								this.handleRemoveCredData(index);
							}}
						/>;
					})}
				</div>
			</div>

			<div>
				<div>cred. item</div>
				<div style={{ background: 'rgb(245, 245, 245)' }}>
					{credItem.map((credItem, index) => {
						return <CredItem
							key={index}
							item={credItem}
							nodes={props.nodes}
							onRemove={() => {
								this.handleRemoveCredItem(index);
							}}
						/>;
					})}
				</div>
			</div>
		</div>;
	},
});


const CredLocation = React.createClass({
	propTypes: {
		locationId: React.PropTypes.string/*.isRequired*/,
		locationOptions: React.PropTypes.array.isRequired,
		nodes: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			locationOptions: [],
			onChange: noop,
			onRemove: noop,
		};
	},

	render() {
		const props = this.props;
		const { locationId } = props;

		const location = {
			value: locationId,
			label: locationId,
		};

		const renderValue = (item) => {
			const node = props.nodes[item[/*valueKey*/ 'value']];
			if (!node) { return null; }
			return <ComponentReference modelComponent={node}>
				{node.label}
			</ComponentReference>;
		};

		return <div>
			<SelectizeDropdown
				multi={false}
				name='credLocation'
				value={(locationId) ? location : undefined}
				options={props.locationOptions}
				valueKey='value'
				labelKey='label'
				onChange={props.onChange/*(name, values)*/}
				extraProps={{ renderValue }}
			/>
			<span> <a href='#' onClick={props.onRemove}>remove</a></span>
		</div>;
	},
});


const CredData = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired,
		nodes: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
			onRemove: noop,
		};
	},

	handleValueChange(updated, index) {
		const props = this.props;
		const { data } = props;
		const updatedData = update(
			data,
			{ values: { [index]: { $set: updated } } }
		);
		props.onChange(updatedData);
	},

	handleNameChange(event) {
		const props = this.props;
		const { data } = props;
		const name = event.target.value;
		const updatedData = update(
			data,
			{ name: { $set: name } }
		);
		props.onChange(updatedData);
	},

	render() {
		const props = this.props;
		const { data } = props;

		return <div>
			<input
				placeholder='name'
				value={data.name || ''}
				onChange={this.handleNameChange}
			/>
			<span> </span>
			{data.values
				.map((value, index) => {
					return <div key={index}>
						<VariableOrSelectize
							data={value}
							nodes={props.nodes}
							onChange={(updated) => {
								this.handleValueChange(updated, index);
							}}
						/>
					</div>;
				})
			}
			<span> <a href='#' onClick={props.onRemove}>remove</a></span>
		</div>;
	},
});


const CredItem = React.createClass({
	propTypes: {
		item: React.PropTypes.object.isRequired,
		nodes: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
			onRemove: noop,
		};
	},

	handleNameChange(event) {
		const props = this.props;
		const { item } = props;
		const name = event.target.value;
		const updatedItem = update(
			item,
			{ name: { $set: name } }
		);
		props.onChange(updatedItem);
	},

	render() {
		const props = this.props;
		const { item } = props;

		return <div>
			<input
				placeholder='name'
				value={item.name || ''}
				onChange={this.handleNameChange}
			/>
			<span> </span>
			{item.values
				.map((value, index) => {
					const component = {
						credItem: <CredItem
							item={value}
							nodes={props.nodes}
						/>,
						credData: <CredData
							data={value}
							nodes={props.nodes}
						/>,
					}[value.type] || null;

					return <div key={index}>
						{component}
						<span> </span>
					</div>;
				})
			}
			<span> <a href='#' onClick={props.onRemove}>remove</a></span>
		</div>;
	},
});


const CredPredicate = React.createClass({
	propTypes: {
		predicate: React.PropTypes.object.isRequired,
		relationTypes: React.PropTypes.array.isRequired,
		relationsMap: React.PropTypes.object.isRequired,
		nodes: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
			onRemove: noop,
		};
	},

	handleRelationChange(name, relation) {
		const props = this.props;
		const { predicate } = props;
		const updatedPredicate = update(
			predicate,
			{ relationType: { $set: relation } }
		);
		props.onChange(updatedPredicate);
	},

	handleValueChange(updated, index) {
		const props = this.props;
		const { predicate } = props;
		const updatedPredicate = update(
			predicate,
			{ values: { [index]: { $set: updated } } }
		);
		props.onChange(updatedPredicate);
	},

	render() {
		const props = this.props;
		const { predicate } = props;
		const { relationTypes, relationsMap } = props;

		const renderSubjObj = (value, index) => {
			return <span style={{ background: 'grey' }}>
				<VariableOrSelectize
					data={value}
					nodes={props.nodes}
					onChange={(updated) => {
						this.handleValueChange(updated, index);
					}}
				/>
			</span>;
		};

		return <div>
			{renderSubjObj(predicate.values[0], 0)}
			<span> </span>
			<span>
				<RelationSelectize
					options={relationTypes}
					value={relationsMap[predicate.relationType]}
					onChange={this.handleRelationChange}
				/>
			</span>
			<span> </span>
			{renderSubjObj(predicate.values[1], 1)}
			<span> <a href='#' onClick={props.onRemove}>remove</a></span>
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

	handleChange(...args) {
		this.props.onChange(...args);
	},

	handleRemove() {
		this.props.onRemove();
	},

	addLocation(event) {
		if (event) { event.preventDefault(); }
		const policy = this.props.policy;
		const updatedPolicy = _add('credLocation', policy, emptyCredLocation);
		this.handleChange(updatedPolicy);
	},

	addData(event) {
		if (event) { event.preventDefault(); }
		const policy = this.props.policy;
		const updatedPolicy = _add('credData', policy, emptyCredData);
		this.handleChange(updatedPolicy);
	},

	addItem(event) {
		if (event) { event.preventDefault(); }
		const policy = this.props.policy;
		const updatedPolicy = _add('credItem', policy, emptyCredItem);
		this.handleChange(updatedPolicy);
	},

	addPredicate(event) {
		if (event) { event.preventDefault(); }
		const policy = this.props.policy;
		const updatedPolicy = _add('credPredicate', policy, emptyCredPredicate);
		this.handleChange(updatedPolicy);
	},

	atLocationsChanged(locationIds) {
		const { policy } = this.props;
		const updatedPolicy = update(
			policy,
			{ atLocations: { $set: locationIds } }
		);
		this.handleChange(updatedPolicy);
	},

	credentialsChanged(credentials) {
		const { policy } = this.props;
		const updatedPolicy = update(
			policy,
			{ credentials: { $set: credentials } }
		);
		this.handleChange(updatedPolicy);
	},

	enabledActionChanged(index, action) {
		const { policy } = this.props;
		const updatedPolicy = update(
			policy,
			{
				enabled: {
					[index]: { $set: action }
				}
			}
		);
		this.handleChange(updatedPolicy);
	},

	render() {
		const props = this.props;
		const { policy } = props;

		return <div>
			<div>
				<a href='#' onClick={this.handleRemove}>delete policy</a>
			</div>
			<div>
				{policy.id}
			</div>

			<div>
				<AtLocations
					nodes={props.nodes}
					locations={policy.atLocations}
					locationOptions={props.locationOptions}
					onChange={(name, values) => {
						this.atLocationsChanged(values);
					}}
				/>
			</div>
			<div>
				{(policy.enabled || [])
					.map((action, index) => {
						return <EnabledAction
							key={action}
							action={action}
							onChange={(action) => {
								this.enabledActionChanged(index, action);
							}}
						/>;
					})
				}
			</div>
			<div>
				<div>
					<div>
						<a
							href='#'
							onClick={this.addLocation}
						>add cred. location</a>
					</div>
					<div>
						<a
							href='#'
							onClick={this.addPredicate}
						>add cred. predicate</a>
					</div>
					<div>
						<a
							href='#'
							onClick={this.addData}
						>add cred. data</a>
					</div>
					<div>
						<a
							href='#'
							onClick={this.addItem}
						>add cred. item</a>
					</div>
				</div>

				<Credentials
					credentials={policy.credentials}
					locationOptions={props.locationOptions}
					relationTypes={props.relationTypes}
					relationsMap={props.relationsMap}
					nodes={props.nodes}
					onChange={this.credentialsChanged}
				/>
			</div>
		</div>;
	},
});


module.exports = PolicyEditor;
