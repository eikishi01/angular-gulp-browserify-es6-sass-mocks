/* eslint-disable no-console, no-undef */

'use strict';
// =======================================================================
// Gulp Plugins
// =======================================================================
var babelify =      require('babelify'),
    browserify =    require('browserify'),
    buffer =        require('vinyl-buffer'),
    del =           require('del'),
    gulp =          require('gulp'),
    KarmaServer =   require('karma').Server,
    watchify =      require('watchify'),
    LRPort =        35729,
    MSPort =        7000,
    plugins =       require('gulp-load-plugins')({
        rename: {
            'gulp-if': 'gulpif',
            'gulp-util': 'gutil'
        }
    }),
    runSequence =   require('run-sequence'),
    source =        require('vinyl-source-stream'),

    // =======================================================================
    // File Paths
    // =======================================================================
    DIST_PATH =     './dist',
    APP_PATH =      './app',
    filePath = {
        build: {
            dest: DIST_PATH
        },
        js: {
            watch: [
                '!' + APP_PATH + '/**/*.spec.js',
                APP_PATH + '/*.js',
                APP_PATH + '/**/*.js'
            ],
            specs: [
                APP_PATH + '/*.spec.js',
                APP_PATH + '/**/*.spec.js'
            ]
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
            templates: {
                watch: [APP_PATH + '/**/*.html']
            },
            images: {
                src: APP_PATH + '/img/**/*',
                watch: [
                    APP_PATH + '/img/**/*'
                ],
                dest: DIST_PATH + '/img/'
            },
            fonts: {
                src: [
                    __dirname + '/node_modules/connect-fonts-roboto/fonts/default/*.woff',
                    __dirname + '/node_modules/connect-fonts-robotocondensed/fonts/default/*.woff'
                ],
                dest: DIST_PATH + '/fonts/'
            }
        },
        vendorJS: {
            // These files will be bundled into a single vendor.js file that's called at the bottom of index.html
            // These are not npm modules or bower vendors
            src: [
                __dirname + '/node_modules/babel-polyfill/dist/polyfill.min.js'
            ]
        },
        vendorCSS: {
            src: [
                __dirname + '/node_modules/normalize.css/normalize.css',
            ]
        },
        docs: {
            src: [
                __dirname + '/README.md'
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
    supportedBrowsers = ['ie 11', 'Firefox >= 45', 'last 2 Chrome versions'];

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
    plugins.nodemon({
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
    plugins.livereload.listen({port: LRPort});

    plugins.gutil.log('---> Local server up and running');
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
gulp.task('ESLint', function() {
    return gulp.src(filePath.lint.src)
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format());
});

// =======================================================================
// Documentation
// =======================================================================
gulp.task('docs', function() {
    return gulp.src(filePath.docs.src)
        .pipe(plugins.markdown())
        .pipe(plugins.wrap({src: 'docs/template.html'}))
        .pipe(gulp.dest(filePath.docs.dest))
        .on('error', handleError);
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
            plugins.gulpif(
                !bundle.prod,
                source('bundle.js'),
                source('bundle-' + prodHash + '.js')
            )
        )
        .on('error', handleError)
        .pipe(buffer())
        .pipe(
            plugins.gulpif(
                !bundle.prod,
                plugins.sourcemaps.init({
                    loadMaps: true
                })
            )
        )
        .pipe(
            plugins.gulpif(!bundle.prod, plugins.sourcemaps.write('./'))
        )
        .pipe(
            plugins.gulpif(
                bundle.prod,
                plugins.streamify(
                    plugins.uglify({
                        mangle: false
                    })
                )
            )
        )
        .pipe(gulp.dest(filePath.build.dest))
        .pipe(
            plugins.gulpif(
                !bundle.prod,
                plugins.livereload()
            )
        )
    ;
}

function configureBundle(prod) {

    prod = prod !== undefined ? prod : false;

    bundle.prod = prod;

    if (!prod) {
        // Use watchify to improve browserify rebundle providing cache
        bundle.bundler = watchify(browserify(bundle.conf));
        bundle.bundler.on('update', rebundle);
    } else {
        bundle.bundler = browserify(bundle.conf);
    }

    bundle.bundler.transform(babelify, {
        'presets': [
            ['env', {
                'targets': {
                    'browsers': supportedBrowsers
                },
                'useBuiltIns': true
            }]
        ]
    });
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
        .pipe(plugins.gulpif(!bundle.prod, plugins.sourcemaps.init()))
        .pipe(plugins.sass())
        .on('error', handleError)
        .pipe(plugins.autoprefixer({
            browsers: supportedBrowsers
        }))
        .pipe(plugins.gulpif(!bundle.prod, plugins.sourcemaps.write()))
        .pipe(plugins.gulpif(bundle.prod, plugins.cleanCss()))
        .pipe(gulp.dest(filePath.build.dest))
        .on('error', handleError)
        .pipe(plugins.livereload())
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
        .pipe(plugins.livereload())
    ;
});

// =======================================================================
// Fonts Task
// =======================================================================
gulp.task('copy-fonts', function() {
    return gulp.src(filePath.assets.fonts.src)
        .on('error', handleError)
        .pipe(gulp.dest(filePath.assets.fonts.dest))
    ;
});

// =======================================================================
// Vendor JS Task
// =======================================================================
gulp.task('vendor-js', function() {
    return gulp.src(filePath.vendorJS.src)
        .pipe(plugins.concat('vendor.js'))
        .on('error', handleError)
        .pipe(gulp.dest(filePath.build.dest))
    ;
});

// =======================================================================
// Vendor CSS Task
// =======================================================================
gulp.task('vendor-css', function() {
    return gulp.src(filePath.vendorCSS.src)
        .pipe(plugins.concat('vendor.css'))
        .on('error', handleError)
    // update paths from vendor files like fontawesome to root folder
        .pipe(plugins.replace('url(../', 'url(./'))
        .pipe(gulp.dest(filePath.build.dest))
    ;
});

// =======================================================================
// Copy index.html
// =======================================================================
gulp.task('copy-index', function() {
    return gulp.src(filePath.copyIndex.src)
        .pipe(
            plugins.gulpif(
                !bundle.prod,
                plugins.replace('[BUNDLEJS]', 'bundle.js'),
                plugins.replace('[BUNDLEJS]', 'bundle-' + prodHash + '.js')
            )
        )
        .pipe(gulp.dest(filePath.build.dest))
        .pipe(plugins.livereload())
    ;
});

// =======================================================================
// Copy Favicon
// =======================================================================
gulp.task('copy-favicon', function() {
    return gulp.src(filePath.copyFavicon.src)
        .pipe(gulp.dest(filePath.build.dest))
    ;
});

// =======================================================================
// Watch for changes
// =======================================================================
gulp.task('watch', function() {
    // gulp.watch(filePath.assets.templates.watch, ['bundleJS-dev']);
    gulp.watch(filePath.vendorJS.src,           ['vendor-js']);
    gulp.watch(filePath.assets.images.watch,    ['copy-images']);
    gulp.watch(filePath.copyIndex.watch,        ['copy-index']);
    gulp.watch(filePath.js.specs,               function() { runSequence('ESLint'); });
    gulp.watch(filePath.js.watch,               function() { runSequence('ESLint'); });
    gulp.watch(filePath.styles.watch,           ['SASS']);
    gulp.watch(filePath.vendorCSS.src,          ['vendor-css']);
    plugins.gutil.log('---> Watching for changes...');
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
        ['clean-reports', 'ESLint'],
        ['karma:watch'],
        callback
    );
});

// run "gulp test" in terminal to start the karma server and evaluate all the tests
gulp.task('build-test', function(callback) {
    runSequence(
        ['clean-reports', 'ESLint'],
        ['karma'],
        callback
    );
});

// run "gulp prod" in terminal to build the PROD-ready app
gulp.task('build-prod', function(callback) {
    runSequence(
        // Cleaners and Linters
        ['clean-dist'],
        // JS Tasks
        ['bundleJS-prod', 'vendor-js'],
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
        ['clean-dist', 'ESLint'],
        // JS Tasks
        ['bundleJS-dev', 'vendor-js'],
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
