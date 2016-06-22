const chalk = require('chalk');


module.exports.f1 = (s) => chalk.magenta(s);

module.exports.f2 = (s) => chalk.bgMagenta.black(s);

module.exports.f3 = (s) => chalk.bgMagenta.white(s);
