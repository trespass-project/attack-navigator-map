const assert = require('assert');
const R = require('ramda');
// const _ = require('lodash');


const common = require('./common.js');

// const trespass = require('trespass.js');
const helpers = require('../app/scripts/helpers.js');
// const modelHelpers = require('../app/scripts/model-helpers.js');


describe(common.f1('helpers.js'), () => {
	describe(common.f2('toHashMap()'), () => {
		const list = [
			{ id: 'item-1' },
			{ id: 'item-2' },
			{ id: 'item-3' },
			{ id: 'item-4' },
			{ id: 'item-5' }
		];
		const key = 'id';
		const result = helpers.toHashMap(key, list);

		it(common.f3('should find the item'), () => {
			assert(R.keys(result).length === list.length);
			list.forEach((item) => {
				assert(result[item.id] === item);
			});
		});
	});

	describe(common.f2('getItemByKey()'), () => {
		const coll = [
			{ id: '1' },
			{ id: '2' },
			{ id: '3' },
			{ id: '4' },
			{ id: '5' }
		];
		const key = 'id';
		const value = '4';
		const badKey = 'name';
		const badValue = '7';

		it(common.f3('should find the item'), () => {
			const result = helpers.getItemByKey(key, coll, value);
			assert(!!result && result.id === value);
		});

		it(common.f3('should not find the item #1'), () => {
			const result = helpers.getItemByKey(key, coll, badValue);
			assert(!result);
		});

		it(common.f3('should not find the item #2'), () => {
			const result = helpers.getItemByKey(badKey, coll, value);
			assert(!result);
		});
	});

	describe(common.f2('ellipsize()'), () => {
		it(common.f3('should work'), () => {
			let input = '0123456789';
			let shortened = helpers.ellipsize(5, input);
			assert(shortened === '012…89' || shortened === '01…789');

			input = '012';
			shortened = helpers.ellipsize(2, input);
			assert(shortened === '0…2');

			input = '01234';
			shortened = helpers.ellipsize(5, input);
			assert(shortened === '01234');

			input = '0';
			shortened = helpers.ellipsize(5, input);
			assert(shortened === '0');
		});
	});

	describe(common.f2('isBetween()'), () => {
		it(common.f3('should work'), () => {
			assert(helpers.isBetween(5, 0, 10));
			assert(!helpers.isBetween(11, 0, 10));
			assert(!helpers.isBetween(-1, 0, 10));
		});
		it(common.f3('should include edge cases'), () => {
			assert(helpers.isBetween(0, 0, 10));
			assert(helpers.isBetween(10, 0, 10));
		});
	});

	describe(common.f2('isRectInsideRect()'), () => {
		const rect = { x: 0, y: 0, width: 100, height: 100 };
		const rectInside = { x: 10, y: 10, width: 50, height: 50 };
		const rectOutside = { x: -10, y: -10, width: 5, height: 5 };
		const rectPartiallyInside = { x: -10, y: -10, width: 50, height: 50 };
		const rectFullOverlap = { x: -10, y: -10, width: 120, height: 120 };
		const rectPartialOverlap1 = { x: 40, y: -10, width: 20, height: 120 };
		const rectPartialOverlap2 = { x: -10, y: 40, width: 120, height: 20 };

		it(common.f3('should work'), () => {
			assert( helpers.isRectInsideRect(rectInside, rect) );
			assert( !helpers.isRectInsideRect(rectOutside, rect) );
		});

		it(common.f3('partial overlap should be considered "inside" #1'), () => {
			assert( helpers.isRectInsideRect(rectPartiallyInside, rect) );
		});

		it(common.f3('partial overlap should be considered "inside" #2'), () => {
			assert( helpers.isRectInsideRect(rectPartialOverlap1, rect) );
			assert( helpers.isRectInsideRect(rectPartialOverlap2, rect) );
		});

		it(common.f3('complete overlap should be considered "inside"'), () => {
			assert( helpers.isRectInsideRect(rectFullOverlap, rect) );
		});
	});

	describe(common.f2('areAttackerProfilesEqual()'), () => {
		const profile = {
			// "intent": "hostile",
			// "access": "external",
			// "outcomes": [
			// 	"damage",
			// 	"embarrassment"
			// ],
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "skills": "minimal",
			// "objectives": [
			// 	"copy",
			// 	"deny",
			// 	"destroy",
			// 	"damage",
			// 	"take"
			// ],
			// "visibility": "overt"
			budget: 5000,
			skill: 'H',
			time: 'S',
		};
		const profileEqual = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": [
			// 	"embarrassment",
			// 	"damage"
			// ],
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"destroy",
			// 	"deny",
			// 	"copy"
			// ]
			time: 'S',
			skill: 'H',
			budget: 5000,
		};
		const profileNotEqual = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": "extra-legal, minor",
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": [
			// 	"embarrassment"
			// ],
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"deny",
			// 	"copy"
			// ]
			budget: 10000,
			skill: 'M',
			time: 'HR',
		};
		const profileIncomplete = {
			// "access": "external",
			// "intent": "hostile",
			// "skills": "minimal",
			// "limit": undefined,
			// "resources": "club",
			// "visibility": "overt",
			// "outcomes": undefined,
			// "objectives": [
			// 	"take",
			// 	"damage",
			// 	"deny",
			// 	"copy"
			// ]
			budget: undefined,
			skill: 'M',
			time: 'HR',
		};

		it(common.f3('should work with equal profiles'), () => {
			assert(helpers.areAttackerProfilesEqual(profile, profileEqual));
			assert(helpers.areAttackerProfilesEqual(profileEqual, profile));
		});

		it(common.f3('should work with unequal profiles'), () => {
			assert(!helpers.areAttackerProfilesEqual(profile, profileNotEqual));
			assert(!helpers.areAttackerProfilesEqual(profileNotEqual, profile));
		});

		it(common.f3('should work with incomplete profiles'), () => {
			assert.doesNotThrow(() => {
				helpers.areAttackerProfilesEqual(profileIncomplete, profileNotEqual);
			});
		});
	});


	describe(common.f2('handleStatus()'), () => {
		const taskStatusData = {
			tool_status: [
				{ name: 'done-1', status: 'done' },
				{ name: 'done-2', status: 'done' },
				{ name: 'done-3', status: 'done' },
				{ name: 'running', status: 'running' },
				{ name: 'test', status: 'test' },
				{ name: 'not-started-1', status: 'not started' },
				{ name: 'not-started-2', status: 'not started' },
			]
		};

		it(common.f3('should return the groups'), () => {
			const categorized = helpers.handleStatus(taskStatusData);
			assert(categorized.completed.length === 3);
			assert(categorized.current.length === 2);
			assert(categorized.pending.length === 2);
		});
	});


	describe(common.f2('replaceIdsInString()'), () => {
		const s = 'id-1, id-2, id-1, id-3';

		it(common.f3('should replace ids'), () => {
			const idReplacementMap = {
				'id-1': 'one',
				'id-2': 'two',
				'id-3': 'three',
			};
			const result = helpers.replaceIdsInString(s, idReplacementMap);
			assert(result === 'one, two, one, three');
		});

		it(common.f3('ids should remain unique'), () => {
			const idReplacementMap = {
				'id-1': 'bla',
				'id-2': 'bla',
				'id-3': 'bla',
			};
			const result = helpers.replaceIdsInString(s, idReplacementMap);
			assert(result === 'bla, bla-2, bla, bla-3');
		});
	});
});
