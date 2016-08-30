const gulp = require('gulp');
const path = require('path');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const notifier = require('node-notifier');
const execSync = require('child_process').execSync;
const koutoSwiss = require('kouto-swiss');

const watch = require('gulp-watch');
const $ = gulpLoadPlugins();
// const reload = browserSync.reload;

function _dir(name, p='') {
	return path.join(name, p);
}
const dirs = require('./variables.js').dirs;
function distDir(p) { return _dir(dirs['dist'], p); }
function tempDir(p) { return _dir(dirs['temp'], p); }
function appDir(p) { return _dir(dirs['app'], p); }
function stylesDir(p) { return _dir(dirs['styles'], p); }
function scriptsDir(p) { return _dir(dirs['scripts'], p); }
function imagesDir(p) { return _dir(dirs['images'], p); }
function dataDir(p) { return _dir('data', p); }
function iconsDir(p) { return _dir(dirs['icons'], p); }
function fontsDir(p) { return _dir(dirs['fonts'], p); }
// function testDir(p) { return _dir(dirs['test'], p); }
// function specDir(p) { return _dir(dirs['spec'], p); }

const pkg = require('./package.json');
const projectName = (pkg.name || path.basename(__dirname));

const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const brfs = require('brfs');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
// ———
const sourceFile = appDir(scriptsDir('main.js'));
const destFileName = 'bundle.js';
// ———
let bundler = browserify({
	entries: [sourceFile],
	transform: [babelify, brfs],
	debug: true,
	insertGlobals: true,
	cache: {},
	packageCache: {},
	fullPaths: true
});

gulp.task('scripts', () => {
	bundler = watchify(bundler);
	bundler.on('update', rebundle);
	bundler.on('log', $.util.log);
	return rebundle();
});

gulp.task('build:scripts', [/*'lint'*/], () => {
	return bundler.add(sourceFile)
		.bundle()
		.pipe(source(destFileName))

		.pipe(buffer()) // convert from stream to buffered vinyl file object
		.pipe(sourcemaps.init())

		.pipe(uglify())

		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(distDir(scriptsDir())));
});

function rebundle() {
	return bundler.bundle()
		// log errors if they happen
		.on('error', () => {
			notifier.notify({
				title: `gulp: ${projectName}`,
				message: 'browserify error',
			});
		})
		.on('error', $.util.log.bind($.util, 'browserify error'))
		.pipe(source(destFileName))
		.pipe(gulp.dest(tempDir(scriptsDir())))
		/*.on('end', reload)*/;
}


// gulp.task('stylus', () => {
gulp.task('styles', () => {
	gulp.src(appDir(stylesDir('main.styl')))
		.pipe($.plumber({
			errorHandler: (err) => {
				console.log(err.message);
				notifier.notify({
					title: `gulp: ${projectName}`,
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
		/*.pipe(reload({ stream: true }))*/;
});


// gulp.task('styles', ['stylus']);


gulp.task('html', ['styles'], () => {
	const assets = $.useref.assets({
		searchPath: [tempDir(), appDir(), '.']
	});

	return gulp.src([appDir('*.html'), tempDir('*.html')])
		.pipe(assets)
		// .pipe($.if('*.js', $.uglify()))
		// .pipe($.if('*.css', $.minifyCss({ compatibility: '*'})))
		.pipe(assets.restore())
		.pipe($.useref())
		// .pipe($.if('*.html', $.minifyHtml({ conditionals: true, loose: true })))
		.pipe(gulp.dest(distDir()));
});


gulp.task('images', () => {
	return gulp.src(appDir(imagesDir('**/*')))
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{ cleanupIDs: false }]
		}))
		.on('error', (err) => {
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest(distDir(imagesDir())));
});


gulp.task('fonts', () => {
	// bootstrap
	gulp.src('node_modules/bootstrap-styl/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	// fontawesome
	gulp.src('node_modules/font-awesome-stylus/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	// fontcustom
	gulp.src(appDir(iconsDir('icons/*.{eot,svg,ttf,woff,woff2}')))
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	// icomoon
	gulp.src(appDir(imagesDir('icomoon/fonts/*.{eot,svg,ttf,woff,woff2}')))
		.pipe(gulp.dest(tempDir(fontsDir())))
		.pipe(gulp.dest(distDir(fontsDir())));

	// source sans
	gulp.src(appDir(fontsDir('SourceSansPro/**/*')))
		.pipe(gulp.dest(tempDir(fontsDir('SourceSansPro'))))
		.pipe(gulp.dest(distDir(fontsDir('SourceSansPro'))));
});


gulp.task('data', () => {
	return gulp.src([appDir(dataDir('**/*'))])
		.pipe(gulp.dest(distDir(dataDir())));
});


gulp.task('icons', () => {
	// fontawesome
	gulp.src(appDir(iconsDir('font-awesome/*.svg')))
		.pipe(gulp.dest(tempDir(iconsDir('font-awesome'))))
		.pipe(gulp.dest(distDir(iconsDir('font-awesome'))));
});


gulp.task('extras', [/*'data',*/ 'icons'], () => {
	return gulp.src([
		appDir('*.*'),
		`!${appDir('*.html')}`,
	], {
		dot: true
	}).pipe(gulp.dest(distDir()));
});


gulp.task('clean', del.bind(null, [tempDir(), distDir()]));


gulp.task('serve', ['scripts', 'styles', 'fonts', 'extras'], () => {
	browserSync.create()
		.init({
			notify: false,
			// port: 9000,
			server: {
				baseDir: [tempDir(), appDir()],
				routes: {
					'/node_modules': 'node_modules',
				}
			}
		},
		() => {
			// notifier.notify({
			// 	title: 'gulp: '+projectName,
			// 	message: 'server running',
			// });
		}
	);

	// watch([
	// 	appDir('*.html'),
	// 	tempDir('*.html'),
	// 	// appDir(scriptsDir('**/*.js')),
	// 	appDir(imagesDir('**/*')),
	// 	tempDir(fontsDir('**/*'))
	// ]).on('change', reload);

	watch(appDir(stylesDir('**/*.{sass,scss,styl}')), ['styles']);

	// watch(appDir(fontsDir('**/*')), ['fonts']);
	// gulp.start('fonts');

	// watch(appDir(iconsDir('*.svg')), ['fontcustom']);
	// gulp.start('fontcustom');
});


gulp.task('fontcustom', ['fontcustom:sass-to-stylus'], () => {
	execSync('mv icons.css icons.styl', { cwd: appDir(iconsDir()) });
});
gulp.task('fontcustom:compile', () => {
	execSync('fontcustom compile', { cwd: appDir(iconsDir()) });
	gulp.start('fonts'); // copy fonts
});
gulp.task('fontcustom:sass-to-stylus', ['fontcustom:compile'], () => {
	const iconsFile = appDir(iconsDir('icons.scss'));
	/*const stream =*/ gulp.src(iconsFile)
		.pipe($.sass.sync({
			// outputStyle: 'expanded',
			// indentedSyntax: true,
			// includePaths: ['.']
		}))
		.pipe(gulp.dest(appDir(iconsDir())));
});


gulp.task('build', ['build:scripts', 'html', 'images', 'fonts', 'extras'], () => {
	return gulp.src(distDir('**/*'))
		.pipe($.size({ title: 'build', gzip: true }));
});


gulp.task('default', ['clean'], () => {
	gulp.start('build');
});
