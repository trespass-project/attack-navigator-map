'use strict';

var $ = require('jquery');
var _ = require('lodash');
var utils = require('../../utils.js');
var constants = require('../../constants.js');
var React = require('react');
var DragSource = require('react-dnd').DragSource;


class LibraryItem extends React.Component {

	constructor(props) {
		super(props);
		utils.autoBind(this);
	}

	render() {
		const props = this.props;
		const connectDragSource = props.connectDragSource;
		return connectDragSource(
			<li className='list-group-item'>{props.data.label}</li>
		);
	}

}

LibraryItem.propTypes = {
	data: React.PropTypes.object.isRequired,
	// injected by react dnd:
	isDragging: React.PropTypes.bool.isRequired,
	connectDragSource: React.PropTypes.func.isRequired
};

var spec = {
	beginDrag: function(props, monitor, component) {
		return { data: props.data };
	},
	endDrag: function(props, monitor, component) {
		if (!monitor.didDrop()) { return; }
		let result = monitor.getDropResult();
		if (result.target === 'debug-view') {
			var graphActions = props.flux.getActions('graph');
			let data = props.data;
			data.id = Math.random() + '';
			data.domain = 'physical';
			graphActions.modelAdd('location', data);
		}
	}
};

// the props to be injected
function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	};
}
LibraryItem = DragSource('LibraryItem', spec, collect)(LibraryItem);


// react + es6
// http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html
class Library extends React.Component {

	constructor(props) {
		super(props);
		utils.autoBind(this);

		this.render_listItem = this.props.renderItem || this.render_listItem;

		var flux = this.props.flux;
		var libraryActions = flux.getActions(this.props.libName);
		libraryActions.loadData(this.props.url);
	}

	render_listItem(item, index) {
		var that = this;
		var onClick = null;
		if (_.isFunction(this.props.onClick)) {
			onClick = function(event) { that.props.onClick(item); };
		}
		return <LibraryItem flux={this.props.flux} onClick={onClick} key={item.id || index} data={item} />;
	}

	render_loading() {
		if (this.props.loading) {
			return <div>loading...</div>;
		} else {
			return null;
		}
	}

	render_error() {
		if (this.props.error) {
			return <div>{this.props.error.status}: {this.props.error.errorMessage}</div>;
		} else {
			return null;
		}
	}

	render_add() {
		// var that = this;
		// var onAdd = this.props.onAdd;
		// if (_.isFunction(onAdd)) {
		// 	var handleAdd = _.wrap(onAdd, function(onAdd) {
		// 		var input = that.refs['add-input'];
		// 		var $input = $(input.getDOMNode());
		// 		var val = $input.val().trim();
		// 		onAdd(val);
		// 	});
		// 	return (
		// 		<div className='add'>
		// 			<input type="text" ref='add-input' /> <button onClick={handleAdd}>add</button>
		// 		</div>
		// 	);
		// } else {
			return null;
		// }
	}

	render() {
		var that = this;
		var props = this.props;
		var list = props.list;

		return (
			<div className='panel-section library-component'>
				<h3 className='title'>{props.title}</h3>
				<div className='search'>
					<input type='search' className='form-control' placeholder='search' onChange={this.search}></input>
				</div>
				{this.render_loading()}
				{this.render_error()}
				<div className="results">
					<ul className='list-group'>{list.map(this.render_listItem)}</ul>
				</div>
				{this.render_add()}
			</div>
		);
	}

	search(event) {
		var flux = this.props.flux;
		var libraryActions = flux.getActions(this.props.libName);

		var $input = $(event.target);
		var query = $input.val().trim();
		libraryActions.filterList(query);
	}
}


Library.propTypes = {
	title: React.PropTypes.string.isRequired,
	url: React.PropTypes.string.isRequired,
	list: React.PropTypes.array.isRequired,

	flux: React.PropTypes.any.isRequired,
	libName: React.PropTypes.string.isRequired,

	renderItem: React.PropTypes.func,
	onClick: React.PropTypes.func,
	onAdd: React.PropTypes.func,
	loading: React.PropTypes.bool,
	query: React.PropTypes.string,
};


// https://github.com/acdlite/flummox/issues/208
// Library.contextTypes = {
// 	flux: React.PropTypes.any
// };


module.exports = Library;
