// const update = require('react-addons-update');
const R = require('ramda');
const mergeWith = require('./reducer-utils.js').mergeWith;
// const omitType = require('./reducer-utils.js').omitType;
const constants = require('./constants.js');


const initialState = {
	analysisRunning: false,
	analysisResults: null,
	resultsSelectedTool: undefined,
	resultsSelectedAttackIndex: undefined,
};


module.exports.reducer =
function reducer(state=initialState, action) {
	const mergeWithState = R.partial(mergeWith, [state]);

	switch (action.type) {
		case constants.ACTION_resetAnalysis:
			return initialState;

		case constants.ACTION_runAnalysis:
			return mergeWithState({
				analysisRunning: true,
			});

		case constants.ACTION_setAnalysisResults:
			return mergeWithState({
				analysisResults: action.analysisResults,
			});

		case constants.ACTION_setAnalysisRunning: {
			const update = {
				analysisRunning: action.yesno,
			};
			if (!action.yesno) {
				update.analysisResults = null;
			}
			return mergeWithState(update);
		}

		case constants.ACTION_setTaskStatusCategorized:
			return mergeWithState({
				taskStatusCategorized: action.taskStatusCategorized,
			});

		case constants.ACTION_resultsSelectTool: {
			const { toolName } = action;
			return mergeWithState({
				resultsSelectedTool: toolName,
			});
		}

		case constants.ACTION_resultsSelectAttack: {
			const { index } = action;
			return mergeWithState({
				resultsSelectedAttackIndex: index,
			});
		}

		default:
			return state;
	}
};
