var assert = require('assert');
var chalk = require('chalk');


var f1 = function(s) {
	return chalk.magenta(s);
};
var f2 = function(s) {
	return chalk.bgMagenta.black(s);
};
var f3 = function(s) {
	return chalk.bgMagenta.white(s);
};


describe(f1('file'), function() {

	describe(f2('function'), function() {

		it(f3('should'), function() {
			assert(false);
		});

	});

})
