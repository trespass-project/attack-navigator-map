const React = require('react');


const name =
module.exports.name = 'PredicateLayer';


const displayName =
module.exports.displayName = 'show predicates';


const adjustProps =
module.exports.adjustProps =
function adjustProps(props) {
	return Object.assign(
		{},
		props,
		{ showPredicateEdges: true }
	);
};


const PredicateLayer = React.createClass({
	render() {
		return null;
	},
});

module.exports.Component = PredicateLayer;
