// const emptyTuple =
// module.exports.emptyTuple = {
// 	type: 'tuple',
// 	values: [],
// };


const emptyValue =
module.exports.emptyValue = {
	type: 'variable',
	// value: '',
};


const emptyVariable =
module.exports.emptyVariable = {
	type: 'variable',
	// value: '',
};


const emptyLocVar =
module.exports.emptyLocVar = {
	type: 'locvar',
	// value: '',
};


const emptyCredLocation =
module.exports.emptyCredLocation = undefined;


const emptyCredPredicate =
module.exports.emptyCredPredicate = {
	relationType: undefined,
	values: [
		emptyValue,
		emptyValue,
	],
};


const emptyCredData =
module.exports.emptyCredData = {
	name: undefined,
	values: [
		// emptyValue,
	],
};


const emptyCredItem =
module.exports.emptyCredItem = {
	name: undefined,
	values: [
		// _.merge(
		// 	{ type: 'credData' },
		// 	emptyCredData
		// )
	],
};


const empty =
module.exports.empty = {
	'credLocation': emptyCredLocation,
	'credData': emptyCredData,
	'credItem': emptyCredItem,
	'credPredicate': emptyCredPredicate,
};

const emptyPolicy =
module.exports.emptyPolicy = {
	enabled: [
		{
			action: undefined,
			location: emptyLocVar,
			values: [],
		}
	]
};


const actionTypes =
module.exports.actionTypes = [
	'in',
	'out',
	'move',
	'eval',
];


const tupleValueTypes =
module.exports.tupleValueTypes = [
	{ v: 'value', label: 'Value' },
	{ v: 'wildcard', label: 'Wildcard' },
	{ v: 'variable', label: 'Variable' },
	{ v: 'input', label: 'Input' },
	{ v: 'tuple', label: 'Tuple' },
];
