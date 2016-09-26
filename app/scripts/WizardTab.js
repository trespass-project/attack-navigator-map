const React = require('react');
const classnames = require('classnames');
const OverlayTrigger = require('react-bootstrap').OverlayTrigger;
const Tooltip = require('react-bootstrap').Tooltip;


const WizardTab = React.createClass({
	propTypes: {
		name: React.PropTypes.string.isRequired,
		selectedSection: React.PropTypes.string.isRequired,
		icon: React.PropTypes.string.isRequired,
		tooltip: React.PropTypes.string.isRequired,
		handleClick: React.PropTypes.func.isRequired,
		isDisabled: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			isDisabled: false,
		};
	},

	render() {
		const props = this.props;
		const isSelected = (props.selectedSection === props.name);

		const onClick = (!props.isDisabled)
			? props.handleClick
			: () => {};

		const tooltip = <Tooltip id={props.name}>{props.tooltip}</Tooltip>;
		const tab = <div
			className={classnames(
				'step-icon',
				{ selected: isSelected },
				{ disabled: props.isDisabled }
			)}
			onClick={onClick}
		>
			<span className={props.icon} />
		</div>;

		return (!props.isDisabled)
			? <OverlayTrigger placement='left' overlay={tooltip} >
				{tab}
			</OverlayTrigger>
			: tab;
	},
});


module.exports = WizardTab;
