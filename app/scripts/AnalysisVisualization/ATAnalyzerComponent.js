'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import xml2js from 'xml2js';

export default class ATAnalyzerComponent extends React.Component {
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
		this.renderList();
	}

	processData() {
		let props = this.props;
		let state = this.state;

		// get data to json
		props.input.forEach((value) => {
			xml2js.parseString(value, (err, res) => {
				let obj = res.adtree;
				obj.raw =  value;
				state.data.push(obj);
			});
		});

		// get total cost
		state.data.forEach((datum) => {
			let totalCost = 0;

			// Traversal
			let nodeQueue = datum.node.slice(0);

			while (nodeQueue.length > 0) {
				let node = nodeQueue.pop();

				// Children
				if (node.node) {
					node.node.forEach(nodeChild => nodeQueue.push(nodeChild));
				}

				if (node.parameter) {
					node.parameter.forEach(param => {
						if (param.$.name == 'cost')
							totalCost += +param._;
					});
				}
			}

			datum.totalCost = totalCost;
		});

		// sort by utility
		state.data.sort(function (a, b) {
			return b.$.utility - a.$.utility;
		});
	}

	getPath(data) {
		let root = data.node.slice(0);
		let path = [];

		let nodeQueue = root;
		while (nodeQueue.length > 0) {
			let node = nodeQueue.pop();
			if (node.node) {
				node.node.forEach(nodeChild => nodeQueue.push(nodeChild));
			}

			path.push(node.label[0]);
		}

		for (let i = 0; i < path.length; i++) {
			path[i] = path[i].trim();
		}

		return path;
	}

	renderList() {
		let props = this.props;
		let state = this.state;
		let refs = this.refs;
		let _this = this;

		let data = state.data;
		let ele = refs.analyzerList;

		let colorArray = ['#ffee56', '#ffb84d', '#ff5151', '#d60000', '#af0000', '#890000'];

		let utilityMax = d3.max(data, d => d.$.utility);
		let costMax = d3.max(data, d=> d.totalCost);

		let utilityScale = d3.scale.linear().domain([0, utilityMax]).range([0, 100]);
		let costScale = d3.scale.linear().domain([0, costMax]).range([0, 100]);

		let utilityColorScale = d3.scale.quantize().domain([0, utilityMax]).range(colorArray);
		let costColorScale = d3.scale.quantize().domain([0, costMax]).range(colorArray);

		let table = d3.select(ele).append('table');

		let columns = ['Utility', 'Cost'];
		let tr = table.append('thead').append('tr')
			.selectAll('th')
			.data(columns).enter()
			.append('td')
			.text(function (d) {
				return d;
			});

		tr = table.append('tbody')
			.selectAll('tr')
			.data(data).enter()
			.append('tr');

		let utilityBar = tr.append('td')
			.append('div')
			.attr('class', 'bar utility')
			.style('width', function (d) {
				return '0%';
			})
			.style('height', function () {
				return '100%';
			})
			.style('background-color', function (d) {
				return utilityColorScale(d.$.utility);
			})

			// .style('padding-left', '10px')
			.html(function (d) {
				return '&nbsp;' + d.$.utility;
			}).transition().duration(1000).style('width', function (d) {
				return utilityScale(d.$.utility) + '%';
			});

		let costBar = tr.append('td')
			.append('div')
			.attr('class', 'bar cost')
			.style('width', function (d) {
				return '0%';
			})
			.style('height', function () {
				return '100%';
			})

			// .style('padding-left', '10px')
			.style('background-color', function (d) {
				return costColorScale(costMax - d.totalCost);
			})
			.html(function (d) {
				return '&nbsp;' + d3.format(',')(d.totalCost);
			}).transition().duration(1000).style('width', function (d) {
				return costScale(d.totalCost) + '%';
			});

		tr.on('mouseover', function (d) {
			d3.select(this).style('background-color', function (d) {
				return '#bdbdbd';
			})
			.style('color', 'white');
			d3.select(this).select('.utility').style('background-color', '#1c3448');
			d3.select(this).select('.cost').style('background-color', '#545454');

			let path = _this.getPath(d);
			props.updatePathCallback(path);
			props.updateTreeCallback(d.raw);
		})
		.on('mouseleave', function (d) {
			d3.select(this).style('background-color', null).style('color', null);
			d3.select(this).select('.utility').style('background-color', function (d) {
				return utilityColorScale(d.$.utility);
			});

			d3.select(this).select('.cost').style('background-color', function (d) {
				return costColorScale(costMax - d.totalCost);
			});

			props.updatePathCallback([]);
		});

	}

	render() {
		let props = this.props;
		let state = this.state;

		return <div id = "atanalyzer">
			<h4>Attack Tree Analyzer< /h4>
			<p>Presents the attack paths with highest utility for an attacker profile. </p>
			<div id = "analyzer-list" ref = "analyzerList"> </div>
			</div>;
	}
}

ATAnalyzerComponent.propTypes = {
	updatePathCallback: React.PropTypes.func,
	input: React.PropTypes.array.isRequired,
};

ATAnalyzerComponent.defaultProps = {
	input: [],
};
