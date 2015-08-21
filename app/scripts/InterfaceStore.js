'use strict';

var _ = require('lodash');
var $ = require('jquery');
var flummox = require('flummox');
var Store = flummox.Store;
var R = require('ramda');
var TWEEN = require('tween.js');
var helpers = require('./helpers.js');
var constants = require('./constants.js');
var theme = require('./graph-theme-default.js');

var klay = require('klayjs');


module.exports =
class InterfaceStore extends Store {

	constructor(flux) {
		super();
		let that = this;

		_.pairs(flux.getActionIds(constants.INTERFACE))
			.forEach(function(pair, index, collection) {
				let key = pair[0];
				let actionId = pair[1];
				that.register(actionId, that[key]);
			});

		this.graphStore = flux.getStore(constants.GRAPH); // TODO: is this bad practice?

		this.state = {
			drag: null,
			dragNode: null,
			hoverNode: null,
			previewEdge: null,

			showEdgeLabels: true,
			showNodeLabels: true,
			showGroupLabels: true,
			showImages: true,
			showEdges: true,
			showGroups: true,
			contextMenu: null,

			selected: null,

			editorElem: null,
			editorTransformElem: null,
			editorElemSize: null,
			visibleRect: null,

			theme,
			scale: 1,
			panX: 0,
			panY: 0,
		};
	}

	setEditorElem(action) {
		let {elem} = action;

		const editorElem = elem;
		const editorTransformElem = $(elem).children('g').first()[0];

		let editorElemSize = this.state.editorElemSize || null;
		if (!this.state.editorElem) {
			const $editor = $(editorElem);
			editorElemSize = {
				width: $editor.width(),
				height: $editor.height(),
			};
		}

		this.setState({
			editorElem,
			editorTransformElem,
			editorElemSize
		});
	}

	select(action) {
		this.setState({ selected: action });
	}

	showContextMenu(action) {
		let {event, context, menuItems} = action;
		let props = {
			x: event.offsetX,
			y: event.offsetY,
			context,
			menuItems
		};
		this.setState({ contextMenu: props });
	}
	hideContextMenu() {
		this.setState({ contextMenu: null });
	}

	setShowGroups(action) {
		this.setState({ showGroups: action.yesno });
	}

	setShowImages(action) {
		this.setState({ showImages: action.yesno });
	}

	setShowEdges(action) {
		this.setState({ showEdges: action.yesno });
	}

	removeGroupBackgroundImage(action) {
		let {group} = action;
		delete group._bgImage;
		this.graphStore._updateModel();
	}

	addGroupBackgroundImage(action) {
		let {group, dataURI, aspectRatio, width} = action;
		group._bgImage = group._bgImage || {};
		group._bgImage.url = dataURI;
		group._bgImage.width = 550;
		group._bgImage.height = 550 / aspectRatio;
		this.graphStore._updateModel();
	}

	resizeGroupBackgroundImage(action) {
		let {group, width, height} = action;
		if (!group._bgImage) { return; }

		group._bgImage.width = Math.max(width, 50);
		group._bgImage.height = Math.max(height, 50);
		this.graphStore._updateModel();
	}

	backgroundImageToNodes(action) {
		let {group} = action;

		let data = group._bgImage.url.replace('data:image/svg+xml;base64,', '');
		data = atob(data);
		const $rootElems = $(data);
		const svg = $rootElems
			.map(function() {
				return $(this)[0];
			})
			.filter(function(index, elem) {
				return elem.tagname === 'svg';
			})[0];
		console.log(svg);

		delete group._bgImage;
		this.graphStore._updateModel();
	}

	setTransformation(action) {
		var {scale/*, panX, panY*/} = action.transformation;

		var showEdgeLabels = false;
		var threshold = 0.5;
		scale = scale || this.state.scale;
		showEdgeLabels = (scale >= threshold);
		var showNodeLabels = showEdgeLabels;
		var showGroupLabels = showEdgeLabels;

		let visibleRect = null;
		if (this.state.editorElem) {
			const editorElem = this.state.editorElem;
			const editorTransformElem = this.state.editorTransformElem;
			const visibleRectPosition = helpers.unTransformFromTo(
				editorElem,
				editorTransformElem,
				{ x: 0,
				  y: 0 }
			);
			visibleRect = {
				x: visibleRectPosition.x,
				y: visibleRectPosition.y,
				width: this.state.editorElemSize.width / scale,
				height: this.state.editorElemSize.height / scale,
			};
		}

		this.setState(
			_.merge(
				{},
				{
					showEdgeLabels: showEdgeLabels,
					showNodeLabels: showNodeLabels,
					showGroupLabels: showGroupLabels,
					visibleRect,
				},
				action.transformation
			)
		);
	}

	_autoLayout() {
		var that = this;

		var children = this.graphStore.state.graph.nodes.map(
			function(node) {
				// node.width = 40;
				// node.height = 40;
				return _.merge({}, node);
			}
		);
		var edges = this.graphStore.state.graph.edges.map(
			function(edge) {
				return {
					source: edge.from,
					target: edge.to,
					id: ''+Date.now() // TODO: helper function to generate ids
				};
			}
		);

		var graph = {
			'id': 'root',
			'children': children,
			'edges': edges
		};

		klay.layout({
			graph: graph,
			options: {
				// http://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/KIML+Layout+Options

				// the-graph uses these values:
				// https://github.com/noflo/klayjs-noflo/blob/master/klay-noflo.js
				'intCoordinates': true,
				'algorithm': 'de.cau.cs.kieler.klay.layered',
				'layoutHierarchy': true,
				'spacing': theme.node.size*3,
				'borderSpacing': 20,
				'edgeSpacingFactor': 0.2,
				'inLayerSpacingFactor': 1.0,
				'nodePlace': 'BRANDES_KOEPF',
				'nodeLayering': 'NETWORK_SIMPLEX',
				'edgeRouting': 'POLYLINE',
				'crossMin': 'LAYER_SWEEP',
				'direction': 'RIGHT'
			},

			success: function(g) {
				var done = false;
				function animate(time) {
					if (done) { return; }
					requestAnimationFrame(animate);
					TWEEN.update(time);
				}

				that.graphStore.state.graph.nodes.forEach(function(node) {
					var newNode = helpers.getItemById(g.children, node.id);
					var tween = new TWEEN.Tween(node)
						.to(_.pick(newNode, 'x', 'y'), 500)
						.easing(TWEEN.Easing.Cubic.InOut)
						.onUpdate(function() {
							that.graphStore._updateModel(); // TODO
						})
						.start()
						.onComplete(function() {
							TWEEN.removeAll();
							done = true;
						});
				});

				animate();
			},

			error: function(err) {
				console.error(err);
			}
		});
	}

	setPreviewEdge(action) {
		let {edge} = action;
		this.setState({ previewEdge: edge });
	}

	setDrag(action) {
		this.setState({ drag: action });
	}

	setDragNode(action) {
		let {node} = action;
		this.setState({ dragNode: node });
	}

	setHoverNode(action) {
		let {node} = action;
		this.setState({ hoverNode: node });
	}

	moveNode(action) {
		let {node, newPos} = action;
		node.x = newPos.x;
		node.y = newPos.y;
		this.graphStore._updateModel();
	}

	moveGroup(action) {
		let that = this;
		let {group, posDelta} = action;

		group.nodeIds
			.forEach(function(id) {
				let node = helpers.getItemById(that.graphStore.state.graph.nodes, id);
				node.x += posDelta.x;
				node.y += posDelta.y;
			});

		this.graphStore._updateModel();
	}

	moveImage(action) {
		let that = this;
		let {group, newPos} = action;

		group._bgImage.groupCenterOffsetX = newPos.groupCenterOffsetX;
		group._bgImage.groupCenterOffsetY = newPos.groupCenterOffsetY;

		this.graphStore._updateModel();
	}

};
