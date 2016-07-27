const React = require('react');


const name =
module.exports.name = 'GroupedComponentsLayer';


const displayName =
module.exports.displayName = 'clustered components layer';


const adjustProps =
module.exports.adjustProps =
function adjustProps(props) {
	return Object.assign(
		{},
		props,
		{ showGroups: false }
	);
};


const onActivation =
module.exports.onActivation =
function onActivation(actionCreators, dispatch) {
	dispatch( actionCreators.nodesStorePosition() );
	dispatch( actionCreators.clusterNodesByType() );
};


const onDeactivation =
module.exports.onDeactivation =
function onDeactivation(actionCreators, dispatch) {
	dispatch( actionCreators.nodesRestorePosition() );
};


const GroupedComponentsLayer = React.createClass({
	propTypes: {
		graph: React.PropTypes.object.isRequired,
		highlightIds: React.PropTypes.array,
	},

	// getDefaultProps() {
	// 	return {
	// 	};
	// },

	contextTypes: {
		theme: React.PropTypes.object,
	},

	render() {
		return null;
	},
});

module.exports.Component = GroupedComponentsLayer;
