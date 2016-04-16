'use strict';

import React from 'react';
import d3 from 'd3';
import $ from 'jquery';
import xml2js from 'xml2js';

export default class ATVisualizerComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
		};
	}

	componentWillMount() {
		this.processData();
	}

	componentDidMount() {
		this.renderGraph();
	}

	componentDidUpdate() {
		$('#tree').empty();

		this.processData();
		this.renderGraph();
	}

	processData() {
		let props = this.props;
		let state = this.state;

		xml2js.parseString(props.input, (err, res) => {
			state.data = res;
		});
	}

	renderGraph() {
		let props = this.props;
		let state = this.state;
		let refs = this.refs;
		let _this = this;

		let data = state.data;
		if (!data) return null;
		let ele = refs.tree;

		let width = $('#tree').width();
		let height = $('#tree').height();

		// width = 1000;
		height = 1080;
		let i = 0;
		let duration = 750;
		let root;

		let tree = d3.layout.tree()
			.children(function (d) {
				// return d._node;
				return d.node;
			})
			.size([width, height]);

		let diagonal = d3.svg.diagonal()
		.projection(function (d) {
			return [d.x, d.y];
		});

		let drag = d3.behavior.drag()
		.on('drag', function (d) {
			let translate = d3.transform(d3.select(this).attr('transform')).translate;
			translate[0] += d3.event.dx;
			translate[1] += d3.event.dy;
			d3.select(this).attr('transform', 'translate(' + translate[0] + ',' + translate[1] + ')');
		});

		let svg = d3.select('#tree').append('svg')
			.attr('width', width)
			.attr('height', height);

		let canvas = svg.append('g')
			.attr('transform', 'translate(' + -width / 2 + ',' + -height / 2 + ')')
			.call(drag);

		let rect = canvas.append('rect')
			.attr('width', '200%')
			.attr('height', '200%')
			.attr('fill', 'black')
			.attr('fill-opacity', '0');

		let tx = (height / 2 + height / 6);
		let graph = canvas.append('g')
			.attr('transform', 'translate(' + width / 2 + ',' + tx + ')');

		// console.log(data);
		root = data.adtree.node[0];
		root.x0 = height / 2;
		root.y0 = 0;

		// console.log(root);
		update(root);

		// d3.select(self.frameElement).style('height', '500px');

		function update(source) {
			// Compute the new tree layout.
			let nodes = tree.nodes(root).reverse();
			let links = tree.links(nodes);

			// console.log(nodes.length);

			// Normalize for fixed-depth.
			nodes.forEach(function (d) {
				d.y = d.depth * 180;
			});

			// Update the nodes…
			let node = graph.selectAll('g.node')
				.data(nodes, function (d) {
					return d.id || (d.id = ++i);
				});

			// Enter any new nodes at the parent's previous position.
			let nodeEnter = node.enter().append('g')
				.attr('class', function (d) {
					return 'node';
				})
				.attr('transform', function (d) {
					return 'translate(' + source.x0 + ',' + source.y0 + ')';
				})
				.on('click', click);

			nodeEnter.append('circle')
				.attr('r', 1e-6)
				.style('fill', function (d) {
					return d.node ? 'lightsteelblue' : '#fff';
				});

			nodeEnter.append('text')
				.attr('x', function (d) {
					return d.children || d.node ? -13 : 13;
				})
				.attr('dy', '.35em')
				.attr('text-anchor', function (d) {
					return d.children || d.node ? 'end' : 'start';
				})
				.text(function (d) {
					return d.label;
				})
				.attr('transform', 'rotate(25)')
				.style('fill-opacity', 1e-6);

			// Transition nodes to their new position.
			let nodeUpdate = node.transition()
				.duration(duration)
				.attr('transform', function (d) {
					return 'translate(' + d.x + ',' + d.y + ')';
				});

			nodeUpdate.select('circle')
				.attr('r', 10)
				.style('fill', function (d) {
					return d.node ? 'lightsteelblue' : '#fff';
				});

			nodeUpdate.select('text')
				.style('fill-opacity', function (d) {
					if (d.root) return 1;
					return 1;
				});

			// Transition exiting nodes to the parent's new position.
			let nodeExit = node.exit().transition()
				.duration(duration)
				.attr('transform', function (d) {
					return 'translate(' + source.x + ',' + source.y + ')';
				})
				.remove();

			nodeExit.select('circle')
				.attr('r', 1e-6);

			nodeExit.select('text')
				.style('fill-opacity', 1e-6);

			// Update the links…
			let link = graph.selectAll('path.link')
				.data(links, function (d) {
					return d.target.id;
				});

			// Enter any new links at the parent's previous position.
			link.enter().insert('path', 'g')
				.attr('class', 'link')
				.attr('d', function (d) {
					var o = {
						x: source.x0,
						y: source.y0,
					};
					return diagonal({
						source: o,
						target: o,
					});
				});

			// Transition links to their new position.
			link.transition()
				.duration(duration)
				.attr('d', diagonal);

			// Transition exiting nodes to the parent's new position.
			link.exit().transition()
				.duration(duration)
				.attr('d', function (d) {
					var o = {
						x: source.x,
						y: source.y,
					};
					return diagonal({
						source: o,
						target: o,
					});
				})
				.remove();

			// Stash the old positions for transition.
			nodes.forEach(function (d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}

		// Toggle children on click.
		function click(d) {
			if (d.node) {
				d._node = d.node;
				d.node = null;
			} else {
				d.node = d._node;
				d._node = null;
			}

			update(d);
		}
	}

	render() {
		return <div id='tree' ref='tree'></div>;
	}
}

ATVisualizerComponent.propTypes = {
	input: React.PropTypes.string.isRequired,
	path: React.PropTypes.array,
};

ATVisualizerComponent.defaultProps = {
	input: '',
	path: [],
};
