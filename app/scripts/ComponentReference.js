const React = require('react');
const actionCreators = require('./actionCreators.js');


const ComponentReference = React.createClass({
	propTypes: {
		modelComponent: React.PropTypes.object.isRequired,
	},

	contextTypes: {
		// theme: React.PropTypes.object,
		dispatch: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
		};
	},

	onMouseEnter(event) {
		this.context.dispatch(
			actionCreators.setHighlighted([this.props.modelComponent.id])
		);
	},

	onMouseLeave(event) {
		this.context.dispatch(
			actionCreators.setHighlighted([])
		);
	},

	render() {
		const props = this.props;
		return <div
			className='component-reference'
			onMouseEnter={this.onMouseEnter}
			onMouseLeave={this.onMouseLeave}
		>
			{props.children}
		</div>;
	},
});


module.exports = ComponentReference;
