module.exports = [
	{
		'type': 'relation',
		'value': 'connects',
		'label': 'connects',
		'directed': false,

		// this is unused
		// TODO: do s.th. with it?
		// 'acceptsSource': ['location'],
		// 'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'network',
		'label': 'network connection',
		'directed': false,
		// 'acceptsSource': ['location'],
		// 'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'atLocation',
		'label': 'is located at',
		'directed': true,
		// 'acceptsSource': ['location'],
		// 'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'atLocation',
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
