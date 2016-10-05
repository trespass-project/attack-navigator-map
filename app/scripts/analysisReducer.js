const update = require('react-addons-update');
const R = require('ramda');
const mergeWith = require('./reducer-utils.js').mergeWith;
const constants = require('./constants.js');


const initialState = {
	analysisRunning: false,
	analysisResults: null,
	resultsSelectedTool: undefined,
	resultsSelectedAttackIndex: undefined,
	resultsAttacktree: undefined,
	analysisSnapshots: [],
	subtreeCache: {},
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
				resultsSelectedAttackIndex: undefined,
			});
		}

		case constants.ACTION_resultsSelectAttack: {
			const { index, attacktree } = action;
			return mergeWithState({
				resultsSelectedAttackIndex: index,
				resultsAttacktree: attacktree,
			});
		}

		case constants.ACTION_setAnalysisResultsSnapshots: {
			const { snapshots } = action;
			return mergeWithState({
				analysisSnapshots: snapshots,
			});
		}

		case constants.ACTION_cacheSubtree: {
			const { selectedTool, index, attacktree, nodeIds } = action;
			return mergeWithState({
				subtreeCache: {
					[selectedTool]: {
						[index]: { attacktree, nodeIds }
					}
				}
			});
		}

		default:
			return state;
	}
};
