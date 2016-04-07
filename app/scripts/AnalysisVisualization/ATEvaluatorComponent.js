'use strict';

import React from 'react';
import d3 from 'd3';
import $ from 'jquery';

export default class ATEvaluatorComponent extends React.Component {
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

	processData() {
		let props = this.props;
		let state = this.state;

		// gets all results in parenthesis
		let unfilteredResults = props.input.split(/\(([^()]+)\)/g);

		let filteredResults = [];

		unfilteredResults.forEach(result => {
			let split = result.split(',');

			// only triplets
			if (split.length == 3) {
				let resultObj = {};
				resultObj.p = +split[0];
				resultObj.cost = +split[1];
				resultObj.path = split[2];

				filteredResults.push(resultObj);
			}
		});

		filteredResults.sort(function (a, b) {
			return b.p - a.p;
		});

		state.data = filteredResults;

		// console.log(filteredResults);
	}

	getPath(data) {
		let path = data.path.split('AND');
		for (let i = 0; i < path.length; i++) {
			path[i] = path[i].trim();
		}

		return path;
	}

	renderGraph() {
		let props = this.props;
		let state = this.state;
		let refs = this.refs;
		let _this = this;

		let data = state.data;
		let ele = refs.evalChart;

		let width = $(ele).width();
		let height = $(ele).height();
		let margin = {
			left: 55,
			right: 30,
			top: 30,
		};

		// Scaffolding
		let x = d3.scale.linear()
		.domain([0, 1])
		.range([0, width]);

		let y = d3.scale.linear()
		.domain([0, d3.max(data, d => d.cost)])
		.range([height, 0]);

		let chart = d3.select(ele)
        .append('svg:svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top * 2)
        .attr('class', 'chart');

		let main = chart.append('g')
		.attr('transform', 'translate(' + margin.left * 1.2 + ',10)')
		.attr('width', width)
		.attr('height', height)
		.attr('class', 'main');

		// x axis
		let xAxis = d3.svg.axis()
        .scale(x)
        .outerTickSize(0)
        .ticks(7)
        .orient('bottom');

		let xAxisElement = main.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'main axis date')
		.call(xAxis);

		let xAxisLabel = main.append('text').attr('x', width / 2)
		.attr('class', 'axis-label')
		.attr('y', height + margin.top * 1.5)
		.style('text-anchor', 'middle')
		.text('Probability');

		// draw the y axis
		let yAxis = d3.svg.axis()
		.scale(y)
		.outerTickSize(0)
		.ticks(7)
		.orient('left');

		let yAxisElement = main.append('g')
		.attr('transform', 'translate(0,0)')
		.attr('class', 'main axis date')
		.call(yAxis);

		let yAxisLabel = main.append('text')
		.attr('class', 'axis-label')
		.attr('transform', 'rotate(-90)')
		.attr('x', -height / 2)
		.attr('y', -margin.left)

		//                .attr("dy", "1em")
		.style('text-anchor', 'middle')
		.text('Cost');

		let line = d3.svg.line()
		.x(function (d) {
			return x(d.p);
		})
		.y(function (d) {
			return y(d.cost);
		});

		// Step graph
		line.interpolate('step-before');

		// Tool tip
		let tooltip = d3.select('body')
		.append('div')
		.style('position', 'absolute')
		.style('z-index', '999999999')
		.style('background-color', 'white')
		.style('border-style', 'solid')
		.style('border-color', 'slategray')
		.style('padding', '3px 3px 3px 3px')
		.style('visibility', 'hidden')
		.text('a simple tooltip');

		// Insert Points
		let g = main.append('svg:g');

		// Add the valueline path.
		let pathSVG = g.append('path')
			.attr('class', 'connect-line')
			.attr('d', line(data))
			.style('fill-opacity', 0)
			.style('stroke-dasharray', '4,4')
			.style('stroke', 'gray')
			.style('opacity', 0)
			.transition().duration(500)
			.style('opacity', 1);

		let enter = g.selectAll('scatter-dots')
			.data(data)
			.enter();

		let circle = enter.append('svg:circle')
			.attr('cx', function (d, i) {
				return x(d.p);
			})
			.attr('cy', function (d) {
				return y(d.cost);
			})
			.on('mouseover', function () {
				d3.select(this).transition()
				.ease('elastic')
				.duration('500')
				.attr('r', 10)
				.style('fill', 'red');

				var d = d3.select(this).data()[0];
				tooltip.html('<i>p</i>: ' + d.p + '<br>cost: ' + d3.format(',')(d.cost));
				tooltip.style('visibility', 'visible');

				let path = _this.getPath(d);
				props.updatePathCallback(path);

			})
			.on('mouseleave', function () {
				d3.select(this).transition()
				.ease('elastic')
				.duration('500')
				.attr('r', 5)
				.style('fill', 'black');

				tooltip.style('visibility', 'hidden');

				props.updatePathCallback([]);

			})
			.on('mousemove', function () {
				tooltip.style('top', (d3.event.pageY - 10) + 'px').style('left', (d3.event.pageX + 10) + 'px');
			})
			.attr('r', 0)
			.transition().duration(500)
			.attr('r', 5);
	}

	render() {

		let evalStyle = {
			height: '400px',
			width: '400px',
			marginBottom: '50px',
		};
		return <div id = "atevaluator">
			<h4>Attack Tree Evaluator</h4>
			<p>Calculates pareto efficient solutions for the attack tree.</p>
				<div id="eval-chart" ref="evalChart" style={evalStyle}> </div>
			</div>;
	}
}

ATEvaluatorComponent.propTypes = {
	updatePathCallback: React.PropTypes.func,
	input: React.PropTypes.string.isRequired,
};

ATEvaluatorComponent.defaultProps = {
	input: '',
};
