// based on generator-gulp-webapp 1.0.2

var gulp = require('gulp');
var path = require('path');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var wiredep = require('wiredep').stream;
var notifier = require('node-notifier');
var execSync = require('child_process').execSync;
var koutoSwiss = require('kouto-swiss');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

function _dir(name, p) {
	p = p || '';
	return path.join(name, p);
}
const dirs = require('./variables.js').dirs;
function distDir(p) { return _dir(dirs['dist'], p); }
function tempDir(p) { return _dir(dirs['temp'], p); }
function appDir(p) { return _dir(dirs['app'], p); }
function stylesDir(p) { return _dir(dirs['styles'], p); }
function jadeDir(p) { return _dir(dirs['jade'], p); }
function scriptsDir(p) { return _dir(dirs['scripts'], p); }
function imagesDir(p) { return _dir(dirs['images'], p); }
function dataDir(p) { return _dir('data', p); }
function iconsDir(p) { return _dir(dirs['icons'], p); }
function fontsDir(p) { return _dir(dirs['fonts'], p); }
function testDir(p) { return _dir(dirs['test'], p); }
function specDir(p) { return _dir(dirs['spec'], p); }

var pkg = require('./package.json');
var projectName = (pkg.name || path.basename(__dirname));

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var brfs = require('brfs');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
// ———
var sourceFile = appDir(scriptsDir('main.js'));
var destFileName = 'bundle.js';
// ———
var bundler = browserify({
	entries: [sourceFile],
	transform: [babelify, brfs],
	debug: true,
	insertGlobals: true,
	cache: {},
	packageCache: {},
	fullPaths: true
});

gulp.task('scripts', function() {
	bundler = watchify(bundler);
	bundler.on('update', rebundle);
	bundler.on('log', $.util.log);
	return rebundle();
});

gulp.task('build:scripts', [/*'lint'*/], function() {
	return bundler.add(sourceFile)
		.bundle()
		.pipe(source(destFileName))

		.pipe(buffer()) // convert from stream to buffered vinyl file object
		.pipe(sourcemaps.init())

		.pipe(uglify())

		.pipe(sourcemaps.write(destFileName + '.map'))
		.pipe(gulp.dest(distDir(scriptsDir())));
});

function rebundle() {
	return bundler.bundle()
		// log errors if they happen
		.on('error', function() {
			notifier.notify({
				title: 'gulp: '+projectName,
				message: 'browserify error',
			});
		})
		.on('error', $.util.log.bind($.util, 'browserify error'))
		.pipe(source(destFileName))
		.pipe(gulp.dest(tempDir(scriptsDir())))
		.on('end', function() {
			reload();
		});
}


gulp.task('stylus', function() {
	gulp.src(appDir(stylesDir('main.styl')))
		.pipe($.plumber({
			errorHandler: function(err) {
				console.log(err.message);
				notifier.notify({
					title: 'gulp: '+projectName,
					message: 'stylus error',
				});
			}
		}))
		.pipe($.sourcemaps.init())
		.pipe($.stylus({
			paths: ['.'],
			use: [koutoSwiss()],
			'include css': true
		}))
		.pipe($.autoprefixer({ browsers: ['last 2 versions'] }))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest(tempDir(stylesDir())))
		.pipe(reload({ stream: true }));
});


gulp.task('styles', ['stylus']);


gulp.task('jade', function () {
	return gulp.src(appDir('*.jade'))
		.pipe($.jade({ pretty: true }))
		.pipe(gulp.dest(tempDir()))
		.pipe(reload({ stream: true }));
});


gulp.task('html', ['jade', 'styles'], function() {
	var assets = $.useref.assets({ searchPath: [tempDir(), appDir(), '.']});

	return gulp.src([appDir('*.html'), tempDir('*.html')])
		.pipe(assets)
		// .pipe($.if('*.js', $.uglify()))
		// .pipe($.if('*.css', $.minifyCss({ compatibility: '*'})))
		.pipe(assets.restore())
		.pipe($.useref())
		// .pipe($.if('*.html', $.minifyHtml({ conditionals: true, loose: true })))
		.pipe(gulp.dest(distDir()));
});


gulp.task('images', function() {
	return gulp.src(appDir(imagesDir('**/*')))
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{ cleanupIDs: false }]
		}))
		.on('error', function (err) {
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest(distDir(imagesDir())));
});


gulp.task('fonts', function() {
	// bootstrap
	gulp.src('bower_components/bootstrap-stylus/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	// fontawesome
	gulp.src('bower_components/Font-Awesome-Stylus/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	// fontcustom
	gulp.src(appDir(iconsDir('icons/*.{eot,svg,ttf,woff,woff2}')))
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	// source sans
	gulp.src(appDir(fontsDir('SourceSansPro/**/*')))
		.pipe(gulp.dest(tempDir(fontsDir('SourceSansPro'))))
		.pipe(gulp.dest(distDir(fontsDir('SourceSansPro'))));

	// return gulp.src(require('main-bower-files')({
	// 	filter: '**/*.{ eot,svg,ttf,woff,woff2 }'
	// }).concat(appDir(fontsDir('**/*'))))
	// 	.pipe(gulp.dest(tempDir(fontsDir())))
	// 	.pipe(gulp.dest(distDir(fontsDir())));
});


gulp.task('data', function() {
	return gulp.src([
			appDir(dataDir('**/*'))
		])
		.pipe(gulp.dest(distDir(dataDir())));
});


gulp.task('extras', ['data'], function() {
	return gulp.src([
		appDir('*.*'),
		'!'+appDir('*.html'),
		'!'+appDir('*.jade')
	], {
		dot: true
	}).pipe(gulp.dest(distDir()));
});


gulp.task('clean', del.bind(null, [tempDir(), distDir()]));


gulp.task('serve', ['jade', 'scripts', 'styles', 'fonts'], function() {
	browserSync.create().init({
			notify: false,
			// port: 9000,
			server: {
				baseDir: [tempDir(), appDir()],
				routes: {
					'/bower_components': 'bower_components'
				}
			}
		},
		function() {
			// notifier.notify({
			// 	title: 'gulp: '+projectName,
			// 	message: 'server running',
			// });
		}
	);

	gulp.watch([
		appDir('*.html'),
		tempDir('*.html'),
		// appDir(scriptsDir('**/*.js')),
		appDir(imagesDir('**/*')),
		tempDir(fontsDir('**/*'))
	]).on('change', reload);

	gulp.watch(appDir('**/*.jade'), ['jade']);
	gulp.watch(appDir(stylesDir('**/*.{sass,scss,styl}')), ['styles']);
	gulp.watch(appDir(fontsDir('**/*')), ['fonts']);
	gulp.watch(appDir(iconsDir('*.svg')), ['fontcustom']);
	gulp.start('fontcustom');
	gulp.watch('bower.json', ['wiredep', 'fonts']);
});


gulp.task('fontcustom', ['fontcustom:sass-to-stylus'], function() {
	execSync('mv icons.css icons.styl', { cwd: appDir(iconsDir()) });
});
gulp.task('fontcustom:compile', function() {
	execSync('fontcustom compile', { cwd: appDir(iconsDir()) });
	gulp.start('fonts'); // copy fonts
});
gulp.task('fontcustom:sass-to-stylus', ['fontcustom:compile'], function() {
	var iconsFile = appDir(iconsDir('icons.scss'));
	var stream = gulp.src(iconsFile)
		.pipe($.sass.sync({
			// outputStyle: 'expanded',
			// indentedSyntax: true,
			// includePaths: ['.']
		}))
		.pipe(gulp.dest(appDir(iconsDir())));
});


// gulp.task('serve:dist', function() {
// 	browserSync.create().init({
// 		notify: false,
// 		// port: 9000,
// 		server: {
// 			baseDir: [distDir()]
// 		}
// 	});
// });


// gulp.task('serve:test', function() {
// 	browserSync.create().init({
// 		notify: false,
// 		// port: 9000,
// 		ui: false,
// 		server: {
// 			baseDir: testDir(),
// 			routes: {
// 				'/bower_components': 'bower_components'
// 			}
// 		}
// 	});

// 	gulp.watch(testDir(specDir('**/*.js'))).on('change', reload);
// 	// gulp.watch(testDir(specDir('**/*.js')), ['lint:test']);
// });


// inject bower components
gulp.task('wiredep', function() {
	gulp.src(appDir(stylesDir('*.{sass,scss,styl}')))
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)+/
		}))
		.pipe(gulp.dest(appDir(stylesDir())));

	// gulp.src(appDir('*.html'))
	gulp.src(appDir(jadeDir('layouts/*.jade')))
		.pipe(wiredep({
			exclude: ['bootstrap-sass', 'bootstrap-stylus'],
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest(appDir()));
});


gulp.task('build', ['build:scripts', 'html', 'images', 'fonts', 'extras'], function() {
	return gulp.src(distDir('**/*'))
		.pipe($.size({ title: 'build', gzip: true }));
});


gulp.task('default', ['clean'], function() {
	gulp.start('build');
});
