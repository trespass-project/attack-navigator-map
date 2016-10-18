const constants = require('./constants.js');

module.exports = [
	{
		'type': 'relation',
		'value': constants.RELTYPE_PHYSICAL_CONNECTION,
		'label': 'connects',
		'directed': false,

		// this is unused
		// TODO: do s.th. with it?
		// 'acceptsSource': ['location'],
		// 'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': constants.RELTYPE_NETWORK,
		'label': 'network connection',
		'directed': false,
		// 'acceptsSource': ['location'],
		// 'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': constants.RELTYPE_ATLOCATION,
		'label': 'is located at',
		'directed': true,
		// 'acceptsSource': ['location'],
		// 'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': constants.RELTYPE_ATLOCATION,
		'label': 'possesses',
		'directed': true,
		// 'acceptsSource': ['location'],
		// 'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'employeeOf',
		'label': 'employee of',
		'directed': true,
		// 'acceptsSource': ['actor'],
		// 'acceptsTarget': ['actor', 'location']
	},

	{
		'type': 'relation',
		'value': 'contractedBy',
		'label': 'contracted by',
		'directed': true,
		// 'acceptsSource': ['actor'],
		// 'acceptsTarget': ['actor', 'location']
	},

	{
		'type': 'relation',
		'value': 'inDepartment',
		'label': 'in department',
		'directed': true,
		// 'acceptsSource': ['actor', 'location'],
		// 'acceptsTarget': ['location']
	}/*,

	{
		'type': 'relation',
		'value': 'canOpen',
		'label': 'can open',
		'directed': true,
		// 'acceptsSource': ['asset'],
		// 'acceptsTarget': ['location']
	}*/
];
