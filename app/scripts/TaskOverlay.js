'use strict';

let React = require('react');
let _ = require('lodash');
let moment = require('moment');
const constants = require('./constants.js');
let actionCreators = require('./action-creators.js');


let TaskOverlay = React.createClass({
	propTypes: {
		taskData: React.PropTypes.object.isRequired,
		dispatch: React.PropTypes.func.isRequired
	},

	cancelTask: function() {
		const props = this.props;
		props.dispatch( actionCreators.cancelTask() );
	},

	closeTaskOverlay: function() {
		const props = this.props;
		props.dispatch( actionCreators.closeTaskOverlay() );
	},

	renderRunning: function() {
		const props = this.props;
		return <div>
			<div>Task running...</div>
			<div>
				<button
					onClick={this.cancelTask}
					className='btn btn-default btn-sm'>
					Cancel
				</button>
			</div>
		</div>;
	},

	renderDone: function() {
		const props = this.props;
		const taskData = props.taskData;

		const format = 'YYYY-MM-DD HH:mm:ss.0';
		const beginDate = moment(taskData.beginDate, format);
		const endDate = moment(taskData.endDate, format);
		const durationInSeconds = (endDate - beginDate).toFixed(2);

		return <div>
			<div>Name: <b>{taskData.name}</b></div>
			{/*<div>Id: <b>{taskData.id}</b></div>*/}
			{/*<div>Status: <b>{taskData.status}</b></div>*/}
			<div>Duration: <b>{durationInSeconds} seconds</b></div>
			{/*<div>Began: <b>{taskData.beginDate}</b></div>
			<div>Ended: <b>{taskData.endDate}</b></div>*/}
			{/*<div>
				<a href={'https://trespass.itrust.lu'+taskData.inputURL}><b>Input file</b></a>
			</div>*/}
			<div>
				<a href={'https://trespass.itrust.lu'+taskData.outputURL} target='_blank'>
					<b>Output file</b>
				</a>
			</div>

			<div>
				<button
					onClick={this.closeTaskOverlay}
					className='btn btn-default btn-sm'>
					OK
				</button>
			</div>
		</div>;
	},

	render: function() {
		const props = this.props;
		return <div id='task-overlay'>
			{(!props.taskData.error)
				? this.renderDone()
				: this.renderRunning()
			}
		</div>;
	},
});


module.exports = TaskOverlay;
