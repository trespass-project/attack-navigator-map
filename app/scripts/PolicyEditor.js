/* eslint react/no-multi-comp: 0 */

const React = require('react');
const SelectizeDropdown = require('./SelectizeDropdown.js');


const noop = () => {};


const AtLocations = React.createClass({
	propTypes: {
		locations: React.PropTypes.array.isRequired,
	},

	getDefaultProps() {
		return {
		};
	},

	render() {
		const props = this.props;

		return <div>
			at locations
		</div>;
	},
});


const EnabledAction = React.createClass({
	propTypes: {
		actions: React.PropTypes.object.isRequired,
	},

	getDefaultProps() {
		return {
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
		};
	},

	render() {
		const props = this.props;

		return <div>
			credentials
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

	handleChange() {
		// TODO: implement
	},

	handleRemove() {
		this.props.onRemove();
	},

	render() {
		const props = this.props;
		const { policy } = props;

		return <div>
			<div>
				{policy.id}
			</div>
			<div>
				<a href='#' onClick={this.handleRemove}>delete</a>
			</div>
			<div>
				<AtLocations locations={policy.atLocations} />
			</div>
			<div>
				<EnabledAction actions={policy.enabled} />
			</div>
			<div>
				<Credentials credentials={policy.credentials} />
			</div>
		</div>;
	},
});


module.exports = PolicyEditor;
