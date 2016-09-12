/* eslint react/no-multi-comp: 0 */

const React = require('react');
const update = require('react-addons-update');
const _ = require('lodash');
const SelectizeDropdown = require('./SelectizeDropdown.js');


const noop = () => {};


const emptyCredLocation = { id: undefined };
const emptyCredData = {};
const emptyCredItem = {};
const emptyCredPredicate = {};


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
	console.log(updateData);

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


const AtLocations = React.createClass({
	propTypes: {
		locations: React.PropTypes.array.isRequired,
	},

	getDefaultProps() {
		return {
			locations: []
		};
	},

	render() {
		const props = this.props;

		return <div>
			<div><b>at locations</b></div>
			<div>
				{JSON.stringify(props.locations)}
				<SelectizeDropdown
					multi={true}
					name='locations'
					value={props.locations}
					options={[]}
				/>
			</div>
		</div>;
	},
});


const EnabledAction = React.createClass({
	propTypes: {
		actions: React.PropTypes.object.isRequired,
	},

	getDefaultProps() {
		return {
			actions: {}
		};
	},

	render() {
		const props = this.props;

		return <div>
			enabled action
		</div>;
	},
});


const Credentials = React.createClass({
	propTypes: {
		credentials: React.PropTypes.object.isRequired,
	},

	getDefaultProps() {
		return {
			credentials: {}
		};
	},

	render() {
		const props = this.props;

		return <div>
			<div>credentials</div>
			<div>{JSON.stringify(props.credentials)}</div>
		</div>;
	},
});


const CredLocation = React.createClass({
	propTypes: {
		location: React.PropTypes.string.isRequired,
	},

	getDefaultProps() {
		return {
		};
	},

	render() {
		const props = this.props;

		return <div>
			cred location: {props.location}
		</div>;
	},
});


const CredData = React.createClass({
	propTypes: {
		// location: React.PropTypes.string.isRequired,
	},

	getDefaultProps() {
		return {
		};
	},

	render() {
		const props = this.props;

		return <div>
			cred data
		</div>;
	},
});


const CredItem = React.createClass({
	propTypes: {
		// location: React.PropTypes.string.isRequired,
	},

	getDefaultProps() {
		return {
		};
	},

	render() {
		const props = this.props;

		return <div>
			cred item
		</div>;
	},
});


const CredPredicate = React.createClass({
	propTypes: {
		// location: React.PropTypes.string.isRequired,
	},

	getDefaultProps() {
		return {
		};
	},

	render() {
		const props = this.props;

		return <div>
			cred item
		</div>;
	},
});


const PolicyEditor = React.createClass({
	propTypes: {
		policy: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			onChange: noop,
			onRemove: noop,
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
				<AtLocations locations={policy.atLocations} />
			</div>
			<div>
				<EnabledAction actions={policy.enabled} />
			</div>
			<div>
				<div>
					<div>
						<a
							href='#'
							onClick={this.addLocation}
						>add location</a>
					</div>
					<div>
						<a
							href='#'
							onClick={this.addData}
						>add data</a>
					</div>
					<div>
						<a
							href='#'
							onClick={this.addItem}
						>add item</a>
					</div>
					<div>
						<a
							href='#'
							onClick={this.addPredicate}
						>add predicate</a>
					</div>
				</div>

				<Credentials credentials={policy.credentials} />
			</div>
		</div>;
	},
});


module.exports = PolicyEditor;
