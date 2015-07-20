'use strict';

var $ = require('jquery');
var _ = require('lodash');
var React = require('react');
var DraggableMixin = require('./DraggableMixin.js');


var Group = React.createClass({
	mixins: [DraggableMixin],

	propTypes: {
		x: React.PropTypes.number.isRequired,
		y: React.PropTypes.number.isRequired,
		width: React.PropTypes.number.isRequired,
		height: React.PropTypes.number.isRequired,
		group: React.PropTypes.object.isRequired,
		flux: React.PropTypes.object.isRequired,
	},

	renderLabel: function() {
		if (!this.props.showGroupLabels) { return null; }
		return (
			<text
				dx={this.props.width*0.5}
				dy={this.props.height*0.5 + 16}
				className='label'>{this.props.group.name}</text>
		);
	},

	render: function() {
		var props = this.props;

		let style = {};
		if (!props.showGroups) { style.display = 'none'; }
		// if (!props.showGroups) return null;

		return (
			<g
				className='group-group'
				style={style}
				onClick={this._onClick}
				transform={'translate('+props.x+','+props.y+')'}>
				<rect
					className='group'
					rx={props.theme.group.cornerRadius}
					ry={props.theme.group.cornerRadius}
					width={props.width}
					height={props.height}>
				</rect>
				{this.renderLabel()}
			</g>
		);
	},

	componentWillMount: function() {
		this._graphActions = this.props.flux.getActions('graph');
		this._interfaceActions = this.props.flux.getActions('interface');
	},

	componentDidMount: function() {
		var that = this;

		var elem = this.getDOMNode();
		$(elem).on('contextmenu', function(event) {
			let bgimg = { label: 'image', icon: '+'/*'&#xe934;'*/, action: that.openFileDialog };
			if (!_.isEmpty(that.props.group._bgImage)) {
				bgimg.icon = '—';
				bgimg.action = function() {
					that._interfaceActions.removeGroupBackgroundImage(that.props.group);
				};
			}

			let menuItems = [
				{ label: 'remove', icon: '—', action:
					function(/*event*/) {
						that._graphActions.removeGroup(that.props.group, true);
					}
				},
				{ label: 'ungroup', icon: '—', action:
					function(/*event*/) {
						that._graphActions.removeGroup(that.props.group);
					}
				},
				bgimg,
				{ label: 'node', icon: '+', action:
					function(/*event*/) {
						let node = {
							x: event.offsetX,
							y: event.offsetY,
							group: that.props.group
						};
						that._graphActions.addNode(node);
					}
				},
			];
			that._interfaceActions.showContextMenu(event, that.props.group, menuItems);
			return false;
		});
	},

	componentWillUnmount: function() {

	},

	openFileDialog: function() {
		let $addfile = $('#add-file');
		$addfile.on('change', this.loadBackgroundFile);
		$addfile.click();
	},
	loadBackgroundFile: function(event) {
		var that = this;
		var file = $('#add-file')[0].files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			var svg = event.target.result;
			var $svg = $($.parseXML(svg)).find('svg').first();
			var w = parseFloat($svg.attr('width'));
			var h = parseFloat($svg.attr('height'));
			// console.log(w, h);
			var aspectRatio = w / h;
			// var dataURI = 'data:image/svg+xml;utf8,'+svg;
			var dataURI = 'data:image/svg+xml;base64,'+btoa(svg);
			// console.log(dataURI);
			that._interfaceActions.addGroupBackgroundImage(that.props.group, dataURI, aspectRatio, w);
		};
		// reader.readAsDataURL(file);
		reader.readAsText(file);

		$('#add-file').off('change', this.loadBackgroundFile);
	},

	_onClick: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this._interfaceActions.select(this.props.group, 'group');
	},

	_onMouseOver: function(event) {
		this._interfaceActions.setHoverGroup(this.props.group);
	},
	_onMouseOut: function(event) {
		this._interfaceActions.setHoverGroup(null);
	},

	_onDragStart: function(event) {
		this.origialPositionX = this.props.x;
		this.origialPositionY = this.props.y;
	},

	_onDragMove: function(event) {
		var props = this.props;

		this.prevPositionX = props.x;
		this.prevPositionY = props.y;

		var newPositionX = this.origialPositionX + event.deltaX / props.scale;
		var newPositionY = this.origialPositionY + event.deltaY / props.scale;

		this._interfaceActions.moveGroup(
			props.group,
			{
				x: newPositionX - this.prevPositionX,
				y: newPositionY - this.prevPositionY
			}
		);
	},

	_onDragEnd: function(event) {
		//
	}
});


module.exports = Group;
