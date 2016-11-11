/*eslint no-console: "allow"*/

'use strict';

var pJoin = function() {
        return Array.prototype.slice.call(arguments,0).join('/');
    },
    // =======================================================================
    // Gulp Plugins
    // =======================================================================
    autoprefixer =  require('gulp-autoprefixer'),
    babel =         require('babelify'),
    browserify =    require('browserify'),
    buffer =        require('vinyl-buffer'),
    cleanCSS =      require('gulp-clean-css'),
    concat =        require('gulp-concat'),
    del =           require('del'),
    eslint =        require('gulp-eslint'),
    gulp =          require('gulp'),
    gulpif =        require('gulp-if'),
    gutil =         require('gulp-util'),
    KarmaServer =   require('karma').Server,
    livereload =    require('gulp-livereload'),
    LRPort =        35729,
    markdown =      require('gulp-markdown'),
    MSPort =        7000,
    nodemon =       require('gulp-nodemon'),
    replace =       require('gulp-replace'),
    runSequence =   require('run-sequence'),
    sass =          require('gulp-sass'),
    source =        require('vinyl-source-stream'),
    sourcemaps =    require('gulp-sourcemaps'),
    streamify =     require('gulp-streamify'),
    uglify =        require('gulp-uglify'),
    wrap =          require('gulp-wrap'),

    // =======================================================================
    // File Paths
    // =======================================================================
    NODE_MODS_DN =  'node_modules',
    DIST_PATH =     './dist',
    APP_PATH =      './app',
    // DOCS_PATH = './docs',
    filePath = {
        build: {
            dest: DIST_PATH
        },
        lint: {
            src: [
                APP_PATH + '/*.js',
                APP_PATH + '/**/*.js'
            ]
        },
        browserify: {
            src: APP_PATH + '/app.js',
            watch: [
                '!./app/**/*.spec.js',
                APP_PATH + '/*.js',
                APP_PATH + '/**/*.js',
                APP_PATH + '/**/*.html'
            ]
        },
        styles: {
            src: APP_PATH + '/app.scss',
            watch: [
                APP_PATH + '/app.scss',
                APP_PATH + '/**/*.scss'
            ]
        },
        assets: {
            images: {
                src: APP_PATH + '/img/**/*',
                watch: [
                    APP_PATH + '/img/**/*'
                ],
                dest: DIST_PATH + '/img/'
            },
            fonts: {
                src: [
                    pJoin(NODE_MODS_DN,'connect-fonts-roboto','fonts','default','*.woff'),
                    pJoin(NODE_MODS_DN,'connect-fonts-robotocondensed','fonts','default','*.woff')
                ],
                dest: DIST_PATH + '/fonts/'
            }
        },
        vendorJS: {
            // These files will be bundled into a single vendor.js file that's called at the bottom of index.html
            // These are not npm modules or bower vendors
            src: []
        },
        vendorCSS: {
            src: [
                pJoin(NODE_MODS_DN,'normalize.css','normalize.css'),
            ]
        },
        docs: {
            src: [
                pJoin('README.md')
            ],
            dest: DIST_PATH + '/docs/'
        },
        copyIndex: {
            src: APP_PATH + '/index.html',
            watch: APP_PATH + '/index.html'
        },
        copyFavicon: {
            src: APP_PATH + '/favicon.png'
        }
    },

    // =======================================================================
    // Other
    // =======================================================================
    bundle =    {},
    prodHash =  Date.now(),
    cssSupBrowsers = ['last 2 versions', '> 5%'];

// =======================================================================
// Error Handling
// =======================================================================
function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

// =======================================================================
// Local/Mock server
// =======================================================================
gulp.task('mock-server', function() {
    // start nodemon to auto-reload the dev server
    nodemon({
        script: 'mockServer/mock.server.js',
        ext: 'js hbs',
        watch: ['mockServer/'],
        env: {
            NODE_ENV:   'development',
            SERVER_PORT:  MSPort,
            LR_PORT:    LRPort,
            ROOT_PATH:  DIST_PATH
        }
    })
    .on('change', function() {
        console.log('[nodemon] mock server updated restarting');
    })
    .on('crash', function() {
        console.log('[nodemon] crashed restarting server');
    })
    .on('restart', function() {
        console.log('[nodemon] restarted mock server');
    });

    // Start live reload
    livereload.listen({port: LRPort});

    gutil.log('---> Local server up and running');
});

// =======================================================================
// Clean dist folder contents on build
// =======================================================================

gulp.task('clean-dist', function() {
    del(['./dist/*']);
});

gulp.task('clean-reports', function() {
    del(['./reports/**/*', './reports']);
});

// =======================================================================
// ESLint
// =======================================================================
gulp.task('js-int', function() {
    return gulp.src(filePath.lint.src)
    .pipe(eslint())
    .pipe(eslint.format());
});

// =======================================================================
// Documentation
// =======================================================================
gulp.task('docs', function() {
    return gulp.src(filePath.docs.src)
    .pipe(markdown())
    .pipe(wrap({src: 'docs/template.html'}))
    .pipe(gulp.dest(filePath.docs.dest))
    .on('error', handleError)
    .on('end', function() { gutil.log('---> Docs task completed'); });
});

// =======================================================================
// Browserify Bundle
// =======================================================================

bundle.conf = {
    entries: filePath.browserify.src,
    //external: filePath.vendorJS.src,
    debug: true,
    cache: {},
    packageCache: {},
    transform: ['partialify']
};

function rebundle() {
    return bundle.bundler.bundle()
        .pipe(
            gulpif(
                !bundle.prod,
                source('bundle.js'),
                source('bundle-' + prodHash + '.js')
            )
        )
        .on('error', handleError)
        .pipe(buffer())
        .pipe(
            gulpif(!bundle.prod,
                sourcemaps.init({
                    loadMaps: true
                })
            )
        )
        .pipe(
            gulpif(!bundle.prod, sourcemaps.write('./'))
        )
        .pipe(
            gulpif(
                bundle.prod,
                streamify(
                    uglify({
                        mangle: false
                    })
                )
            )
        )
        .pipe(gulp.dest(filePath.build.dest))
        .pipe(livereload())
    ;
}

function configureBundle(prod, babelify) {

    prod = prod !== undefined ? prod : false;
    babelify = babelify !== undefined ? babelify : true;

    bundle.bundler = browserify(bundle.conf);

    if (babelify) {
        bundle.bundler.transform(babel.configure({
            // Use all of the ES2015 spec
            presets: ['es2015']
        }));
    }

    if (!prod) {
        bundle.bundler.on('update', rebundle);
    }

    bundle.prod = prod;
    bundle.babelify = babelify;
}

gulp.task('bundleJS-dev', function() {
    configureBundle(false);
    return rebundle();
});

gulp.task('bundleJS-prod', function() {
    configureBundle(true);
    return rebundle();
});

// =======================================================================
// SASS Task
// =======================================================================

function sassFilesProcess() {
    return gulp.src(filePath.styles.src)
    .pipe(gulpif(!bundle.prod, sourcemaps.init()))
    .pipe(sass())
        .on('error', handleError)
    .pipe(autoprefixer({
        browsers: cssSupBrowsers
    }))
    .pipe(gulpif(!bundle.prod, sourcemaps.write()))
    .pipe(gulpif(bundle.prod, cleanCSS()))
    .pipe(gulp.dest(filePath.build.dest))
        .on('error', handleError)
        .on('end', function() { gutil.log('---> Styles task completed'); })
    .pipe(livereload())
    ;
}

gulp.task('SASS', sassFilesProcess);

// =======================================================================
// Images Task
// =======================================================================
gulp.task('copy-images', function() {
    return gulp.src(filePath.assets.images.src)
        .on('error', handleError)
    .pipe(gulp.dest(filePath.assets.images.dest))
        .on('end', function() { gutil.log('---> Images copy completed'); })
    .pipe(livereload())
    ;
});

// =======================================================================
// Fonts Task
// =======================================================================
gulp.task('copy-fonts', function() {
    return gulp.src(filePath.assets.fonts.src)
            .on('error', handleError)
        .pipe(gulp.dest(filePath.assets.fonts.dest))
            .on('end', function() { gutil.log('---> Fonts copy task completed'); })
        ;
});

// =======================================================================
// Vendor JS Task
// =======================================================================
gulp.task('vendor-js', function() {
    var b = browserify({
        debug: true,
        require: filePath.vendorJS.src
    });
    return b.bundle()
    .pipe(source('vendor.js'))
    .on('error', handleError)
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(filePath.build.dest))
    .on('end', function() { gutil.log('---> VendorJS task completed'); });
});

// =======================================================================
// Vendor CSS Task
// =======================================================================
gulp.task('vendor-css', function() {
    return gulp.src(filePath.vendorCSS.src)
    .pipe(concat('vendor.css'))
        .on('error', handleError)
    // update paths from vendor files like fontawesome to root folder
    .pipe(replace('url(../', 'url(./'))
    .pipe(gulp.dest(filePath.build.dest))
        .on('end', function() { gutil.log('---> VendorCSS task completed'); })
    ;
});

// =======================================================================
// Copy index.html
// =======================================================================
gulp.task('copy-index', function() {
    return gulp.src(filePath.copyIndex.src)
    .pipe(
        gulpif(
            !bundle.prod,
            replace('[BUNDLEJS]', 'bundle.js'),
            replace('[BUNDLEJS]', 'bundle-' + prodHash + '.js')
        )
    )
    .pipe(gulp.dest(filePath.build.dest))
        .on('end', function() { gutil.log('---> index.html copy task completed'); })
    .pipe(livereload())
    ;
});

// =======================================================================
// Copy Favicon
// =======================================================================
gulp.task('copy-favicon', function() {
    return gulp.src(filePath.copyFavicon.src)
    .pipe(gulp.dest(filePath.build.dest))
        .on('end', function() { gutil.log('---> favicon copy task completed'); });
});

// =======================================================================
// Watch for changes
// =======================================================================
gulp.task('watch', function() {
    gutil.log('---> Watching...');
    gulp.watch(filePath.styles.watch, ['SASS']);
    gulp.watch(filePath.assets.images.watch, ['copy-images']);
    gulp.watch(filePath.copyIndex.watch, ['copy-index']);
    gulp.watch(filePath.browserify.watch, ['js-int', 'bundleJS-dev']);
    // gulp.watch(filePath.vendorJS.src, ['vendor-js']); //NOSONAR
    // gulp.watch(filePath.vendorCSS.src, ['vendor-css']);
});

// =======================================================================
// Karma Configuration
// =======================================================================
gulp.task('karma:watch', function(done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        autoWatch: true
    }, function(exitCode) {
        console.log('Karma has exited with ' + exitCode);
        done();
    }).start();
});

gulp.task('karma', function(done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function(exitCode) {
        console.log('Karma has exited with ' + exitCode);
        done();
    }).start();
});

// =======================================================================
// Sequential Build Rendering
// =======================================================================

// run "gulp test" in terminal to start the karma server and evaluate all the tests
gulp.task('build-test:watch', function(callback) {
    runSequence(
        ['clean-reports', 'js-int'],
        ['karma:watch'],
        callback
    );
});

// run "gulp test" in terminal to start the karma server and evaluate all the tests
gulp.task('build-test', function(callback) {
    runSequence(
        ['clean-reports', 'js-int'],
        ['karma'],
        callback
    );
});

// run "gulp prod" in terminal to build the PROD-ready app
gulp.task('build-prod', function(callback) {
    runSequence(
        // Cleaners and Linters
        ['clean-dist', 'js-int'],
        // JS Tasks
        ['bundleJS-prod'/*, 'vendor-js'*/],
        // CSS Tasks
        ['vendor-css', 'SASS'],
        // Assets Tasks
        ['copy-images', 'copy-fonts', 'copy-index', 'copy-favicon'],
        callback
    );
});

// run "gulp build" in terminal for a full re-build in DEV
gulp.task('build', function(callback) {
    runSequence(
        // Cleaners and Linters
        ['clean-dist', 'js-int'],
        // JS Tasks
        ['bundleJS-dev'/*, 'vendor-js'*/],
        // CSS Tasks
        ['vendor-css', 'SASS'],
        // Assets Tasks
        ['copy-images', 'copy-fonts', 'copy-index', 'copy-favicon'],
        // Others
        ['docs'],
        // Local and Mock server
        ['watch', 'mock-server'],
        callback
    );
});

gulp.task('default', ['build']);
gulp.task('test', ['build-test']);
gulp.task('test:watch', ['build-test:watch']);
gulp.task('prod', ['build-prod']);
