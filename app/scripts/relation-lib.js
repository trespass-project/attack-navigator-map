module.exports = [
	{
		'type': 'relation',
		'value': 'connects',
		'label': 'connects',
		'directed': false,

		// this is unused
		// TODO: do s.th. with it?
		'acceptsSource': ['location'],
		'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'network',
		'label': 'network connection',
		'directed': false,
		'acceptsSource': ['location'],
		'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'at-location',
		'label': 'contained in',
		'directed': true,
		'acceptsSource': ['location'],
		'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'at-location',
		'label': 'is at',
		'directed': true,
		'acceptsSource': ['location'],
		'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'possesses',
		'label': 'possesses',
		'directed': true,
		'acceptsSource': ['location'],
		'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'owns',
		'label': 'owns',
		'directed': true,
		'acceptsSource': ['actor'],
		'acceptsTarget': []
	},

	{
		'type': 'relation',
		'value': 'employee-of',
		'label': 'employee of',
		'directed': true,
		'acceptsSource': ['actor'],
		'acceptsTarget': ['actor', 'location']
	},

	{
		'type': 'relation',
		'value': 'contracted-by',
		'label': 'contracted by',
		'directed': true,
		'acceptsSource': ['actor'],
		'acceptsTarget': ['actor', 'location']
	},

	{
		'type': 'relation',
		'value': 'in-department',
		'label': 'in department',
		'directed': true,
		'acceptsSource': ['actor', 'location'],
		'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'can-open',
		'label': 'can open',
		'directed': true,
		'acceptsSource': ['asset'],
		'acceptsTarget': ['location']
	},

	{
		'type': 'relation',
		'value': 'logical-access',
		'label': 'logical acces',
		'directed': true,
		'acceptsSource': ['actor'],
		'acceptsTarget': ['location']
	}
];
