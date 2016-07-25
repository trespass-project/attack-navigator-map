const R = require('ramda');

// editor options
// const accessOptions = [
// 	{ value: 'external', title: 'external', className: 'medium' },
// 	{ value: 'internal', title: 'internal', className: 'veryhigh' },
// ];
// const intentOptions = [
// 	{ value: 'non-hostile', title: 'non-hostile', className: 'low' },
// 	{ value: 'hostile', title: 'hostile', className: 'veryhigh' },
// ];
// const outcomesOptions = [
// 	{ value: 'acquisition / theft', title: 'acquisition / theft' },
// 	{ value: 'business advantage', title: 'business advantage' },
// 	{ value: 'damage', title: 'damage' },
// 	{ value: 'embarrassment', title: 'embarrassment' },
// 	{ value: 'tech advantage', title: 'tech advantage' }
// ];
// const limitOptions = [
// 	{ value: 'code of conduct', title: 'code of conduct', className: 'low' },
// 	{ value: 'legal', title: 'legal', className: 'medium' },
// 	{ value: 'extra-legal, minor', title: 'extra-legal, minor', className: 'high' },
// 	{ value: 'extra-legal, major', title: 'extra-legal, major', className: 'veryhigh' }
// ];
// const resourcesOptions = [
// 	{ value: 'individual', title: 'individual', className: 'low' },
// 	{ value: 'club', title: 'club', className: 'medium' },
// 	{ value: 'contest', title: 'contest', className: 'high' },
// 	{ value: 'team', title: 'team', className: 'high' },
// 	{ value: 'organization', title: 'organization', className: 'veryhigh' },
// 	{ value: 'government', title: 'government', className: 'veryhigh' }
// ];
// const skillOptions = [
// 	{ value: 'none', title: 'none', className: 'low' },
// 	{ value: 'minimal', title: 'minimal', className: 'medium' },
// 	{ value: 'operational', title: 'operational', className: 'high' },
// 	{ value: 'adept', title: 'adept', className: 'veryhigh' }
// ];
// const objectivesOptions = [
// 	{ value: 'copy', title: 'copy' },
// 	{ value: 'deny', title: 'deny' },
// 	{ value: 'destroy', title: 'destroy' },
// 	{ value: 'damage', title: 'damage' },
// 	{ value: 'take', title: 'take' }
// ];
// const visibilityOptions = [
// 	{ value: 'overt', title: 'overt' },
// 	{ value: 'covert', title: 'covert' },
// 	{ value: 'clandestine', title: 'clandestine' },
// 	{ value: 'multiple', title: 'multiple' },
// ];
const skillOptions = [
	{ value: 'L', title: 'low', className: 'low' },
	{ value: 'M', title: 'medium', className: 'medium' },
	{ value: 'H', title: 'high', className: 'high' },
	{ value: 'V', title: 'very high', className: 'veryhigh' }
];
const budgetOptions = [
	{ value: Number, title: 'budget'/*, className: 'low'*/ }
];
const timeOptions = [
	{ value: 'S', title: 'seconds', className: 'low' },
	{ value: 'MT', title: 'minutes', className: 'medium' },
	{ value: 'HR', title: 'hours', className: 'medium' },
	{ value: 'D', title: 'days', className: 'high' },
	{ value: 'M', title: 'months', className: 'high' }, // ?
	{ value: 'Y', title: 'years', className: 'veryhigh' } // ?
];

// const options = module.exports.options = [
// 	{ name: 'access', options: accessOptions },
// 	{ name: 'resources', options: resourcesOptions },
// 	{ name: 'skill', options: skillOptions },
// 	{ name: 'visibility', options: visibilityOptions },
// 	{ name: 'limit', options: limitOptions },
// 	{ name: 'intent', options: intentOptions },
// 	{ name: 'outcomes', options: outcomesOptions, multiple: true },
// 	{ name: 'objectives', options: objectivesOptions, multiple: true },
// ];
const options = module.exports.options = [
	{ name: 'budget', options: budgetOptions },
	{ name: 'skill', options: skillOptions },
	{ name: 'time', options: timeOptions }
];


const values =
module.exports.values = options
	.reduce((result, item) => {
		result[item.name] = item.options
			.map(R.prop('value'));
		return result;
	}, {});


// presets
// module.exports.profiles =
// [
// 	{
// 		"title": "Employee Reckless",
// 		"intent": "non-hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "legal",
// 		"resources": "individual",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy",
// 			"deny",
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "covert"
// 	},
// 	{
// 		"title": "Employee Untrained",
// 		"intent": "non-hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "code of conduct",
// 		"resources": "individual",
// 		"skills": "minimal",
// 		"objectives": [
// 			"copy",
// 			"deny",
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "overt"
// 	},
// 	{
// 		"title": "Info Partner",
// 		"intent": "non-hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "code of conduct",
// 		"resources": "individual",
// 		"skills": "operational",
// 		"objectives": [
// 			"copy",
// 			"deny",
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "clandestine"
// 	},
// 	{
// 		"title": "Anarchist",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"damage"
// 		],
// 		"limit": "extra-legal, major",
// 		"resources": "club",
// 		"skills": "none",
// 		"objectives": [
// 			"destroy"
// 		],
// 		"visibility": "overt"
// 	},
// 	{
// 		"title": "Civil Activist",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"embarrassment"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "organization",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy"
// 		],
// 		"visibility": "covert"
// 	},
// 	{
// 		"title": "Competitor",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"business advantage",
// 			"tech advantage"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "organization",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy"
// 		],
// 		"visibility": "clandestine"
// 	},
// 	{
// 		"title": "Corrupt Government Official",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"business advantage",
// 			"tech advantage"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "government",
// 		"skills": "adept",
// 		"objectives": [
// 			"deny"
// 		],
// 		"visibility": "overt"
// 	},
// 	{
// 		"title": "Data Miner",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"business advantage",
// 			"tech advantage"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "team",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy"
// 		],
// 		"visibility": "clandestine"
// 	},
// 	{
// 		"title": "Employee Disgruntled",
// 		"intent": "hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "extra-legal, major",
// 		"resources": "individual",
// 		"skills": "operational",
// 		"objectives": [
// 			"destroy",
// 			"damage"
// 		],
// 		"visibility": "multiple"
// 	},
// 	{
// 		"title": "Government Cyberwarrior",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "extra-legal, major",
// 		"resources": "government",
// 		"skills": "adept",
// 		"objectives": [
// 			"deny",
// 			"destroy",
// 			"damage"
// 		],
// 		"visibility": "multiple"
// 	},
// 	{
// 		"title": "Government Spy",
// 		"intent": "hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"business advantage",
// 			"tech advantage"
// 		],
// 		"limit": "extra-legal, major",
// 		"resources": "government",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy"
// 		],
// 		"visibility": "clandestine"
// 	},
// 	{
// 		"title": "Internal Spy",
// 		"intent": "hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"acquisition / theft",
// 			"tech advantage"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "organization",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy"
// 		],
// 		"visibility": "clandestine"
// 	},
// 	{
// 		"title": "Irrational Individual",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "extra-legal, major",
// 		"resources": "individual",
// 		"skills": "none",
// 		"objectives": [
// 			"copy",
// 			"deny",
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "multiple"
// 	},
// 	{
// 		"title": "Legal Adversary",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"business advantage",
// 			"embarrassment"
// 		],
// 		"limit": "legal",
// 		"resources": "organization",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy",
// 			"take"
// 		],
// 		"visibility": "overt"
// 	},
// 	{
// 		"title": "Mobster",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"acquisition / theft"
// 		],
// 		"limit": "extra-legal, major",
// 		"resources": "organization",
// 		"skills": "adept",
// 		"objectives": [
// 			"take"
// 		],
// 		"visibility": "covert"
// 	},
// 	{
// 		"title": "Radical Activist",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "organization",
// 		"skills": "adept",
// 		"objectives": [
// 			"copy",
// 			"deny",
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "overt"
// 	},
// 	{
// 		"title": "Sensationalist",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"damage",
// 			"embarrassment"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "club",
// 		"skills": "minimal",
// 		"objectives": [
// 			"copy",
// 			"deny",
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "overt"
// 	},
// 	{
// 		"title": "Terrorist",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"damage"
// 		],
// 		"limit": "extra-legal, major",
// 		"resources": "organization",
// 		"skills": "adept",
// 		"objectives": [
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "covert"
// 	},
// 	{
// 		"title": "Thief",
// 		"intent": "hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"acquisition / theft"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "individual",
// 		"skills": "none",
// 		"objectives": [
// 			"take"
// 		],
// 		"visibility": "clandestine"
// 	},
// 	{
// 		"title": "Vandal",
// 		"intent": "hostile",
// 		"access": "external",
// 		"outcomes": [
// 			"damage"
// 		],
// 		"limit": "extra-legal, minor",
// 		"resources": "contest",
// 		"skills": "operational",
// 		"objectives": [
// 			"copy",
// 			"deny",
// 			"destroy",
// 			"damage",
// 			"take"
// 		],
// 		"visibility": "covert"
// 	},
// 	{
// 		"title": "Vendor",
// 		"intent": "hostile",
// 		"access": "internal",
// 		"outcomes": [
// 			"business advantage",
// 			"tech advantage"
// 		],
// 		"limit": "legal",
// 		"resources": "team",
// 		"skills": "operational",
// 		"objectives": [
// 			"copy"
// 		],
// 		"visibility": "clandestine"
// 	}
// ];
