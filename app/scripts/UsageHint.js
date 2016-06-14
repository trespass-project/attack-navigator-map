const React = require('react');
const Alert = require('react-bootstrap').Alert;


const UsageHint = React.createClass({
	render() {
		return <div className='usage-hint'>
			<Alert bsStyle='info'>
				{this.props.children}
			</Alert>
		</div>;
	},
});


module.exports = UsageHint;
