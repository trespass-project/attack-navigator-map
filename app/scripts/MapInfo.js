const React = require('react');
const actionCreators = require('./actionCreators.js');
const knowledgebaseApi = require('trespass.js').api.knowledgebase;
const DividingSpace = require('./DividingSpace.js');
const Accordion = require('react-bootstrap').Accordion;
const Panel = require('react-bootstrap').Panel;


const MapInfo = React.createClass({
	propTypes: {
		hasOpenMap: React.PropTypes.bool,
		metadata: React.PropTypes.object.isRequired,
		saveMap: React.PropTypes.func.isRequired,
	},

	contextTypes: {
		dispatch: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			hasOpenMap: false,
			metadata: {},
		};
	},

	renameMap(event) {
		if (event) { event.preventDefault(); }
		let newName = prompt('Enter new name');
		if (!newName) { return; }
		newName = newName.trim();
		if (!newName) { return; }
		const modelId = this.props.metadata.id;
		this.context.dispatch(
			actionCreators.renameMap(modelId, newName)
		);
	},

	deleteModel(event) {
		if (event) { event.preventDefault(); }
		const modelId = this.props.metadata.id;
		this.context.dispatch(
			actionCreators.deleteModel(modelId)
		);
	},

	fetchKbData(event) {
		if (event) { event.preventDefault(); }
		const modelId = this.props.metadata.id;
		this.context.dispatch(
			actionCreators.fetchKbData(modelId)
		);
	},

	render() {
		const { props } = this;
		const modelId = props.metadata.id;

		return <div className='map-info'>
			{(!props.hasOpenMap) &&
				<span className='disabled'>no map open</span>
			}
			{(props.hasOpenMap) &&
				<div>
					<table>
						<tbody>
							<tr>
								<td>
									<label>Model id:</label>
								</td>
								<td>
									{modelId}
								</td>
							</tr>
							<tr>
								<td>
									<label>Title:</label>
								</td>
								<td>
									{props.metadata.title}
									<a
										href='#'
										style={{ marginLeft: '0.5em' }}
										onClick={this.renameMap}
									>edit</a>
								</td>
							</tr>
						</tbody>
					</table>

					<div>
						<DividingSpace />
						<button
							onClick={props.saveMap}
							className='btn btn-default custom-button'
						>
							Save map
						</button>

						<DividingSpace />
						<button
							onClick={this.deleteModel}
							className='btn btn-default custom-button'
						>
							Delete map
						</button>

						<DividingSpace />
					</div>

					<div>
						<Accordion>
							<Panel header='Debug options' eventKey='1'>
								<div style={{ fontSize: 14 }}>
									<DividingSpace />

									<a
										href={`${knowledgebaseApi.host}tkb/files/edit?model_id=${modelId}`}
										target='_blank'
									>
										edit knowledgebase files
									</a>

									<br />

									<a
										href='#'
										onClick={this.fetchKbData}
									>re-fetch knowledgebase data</a>

									<br />

									<a
										href={`${knowledgebaseApi.host}tkb/files/zip?model_id=${modelId}`}
										target='_blank'
									>download knowledgebase files</a>
								</div>
							</Panel>
						</Accordion>
					</div>
				</div>
			}
			<hr />
		</div>;
	},
});


module.exports = MapInfo;
