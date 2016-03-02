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


// TODO: remove this

module.exports =
class InterfaceStore extends Store {

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

	_autoLayout() {
		const that = this;
		let state = this.graphStore.state;

		let nodesInGoupsIds = [];
		let groups = state.graph.groups.map(function(group, index) {
			nodesInGoupsIds = R.concat(nodesInGoupsIds, group.nodeIds);
			let nodeFromId = R.partial(helpers.getItemById, [state.graph.nodes]);
			let children = group.nodeIds
				.map(nodeFromId)
				.map(function(node) {
					return _.merge(
						node,
						{ width: theme.node.size,
						  height: theme.node.size }
					);
				});

			return {
				id: helpers.makeId('group'),
				children: children,
				group: true
			};
		});

		nodesInGoupsIds = R.uniq(nodesInGoupsIds);
		let nodeInGroup = nodesInGoupsIds.reduce(function(result, nodeId) {
			result[nodeId] = true;
			return result;
		}, {});

		let children = state.graph.nodes.map(
			function(node) {
				if (nodeInGroup[node.id]) {
					return null;
				}
				return _.merge(
					node,
					{ width: theme.node.size,
					  height: theme.node.size }
				);
			}
		);
		children = _.compact(children);
		children = children.concat(groups);

		let edges = state.graph.edges.map(
			function(edge, index) {
				return {
					source: edge.from,
					target: edge.to,
					id: helpers.makeId('edge')
				};
			}
		);

		let graph = {
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

				// post-process groups
				g.children.forEach(function(child) {
					if (child.group === true) {
						child.children.forEach(function(node) {
							node.x += child.x;
							node.y += child.y;
						});
					}
				});

				state.graph.nodes.forEach(function(node) {
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

};
