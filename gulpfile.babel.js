'use strict';

import path from 'path';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import {output as pagespeed} from 'psi';
import pkg from './package.json';

// Variables
const $ = gulpLoadPlugins();
const reload = browserSync.reload;

  // URL Site
  const site = 'http://allanalexandre.github.io/brahma';

  // Assets Paths
  const paths = {
    html:    ['core/templates/**/*.html', 'core/index.html'],
    styles:  ['core/styles/**/*.{css, scss}'],
    scripts:  ['core/scripts/**/*.js'],
    images:  ['core/images/**/*']
  };

  // Lint JavaScript (Google ESLint)
  gulp.task('lint', () =>
    gulp.src('core/scripts/**/*.js')
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failOnError()))
  );

  // JS Files
  gulp.task('scripts', () =>
      gulp.src([
        // Note: Since we are not using useref in the scripts build pipeline,
        //       you need to explicitly list your scripts here in the right order
        //       to be correctly concatenated
        './core/scripts/scripts.js'
        // Other scripts
      ])
        .pipe($.newer('.tmp/scripts'))
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe($.concat('scripts.min.js'))
        .pipe($.uglify({preserveComments: 'some'}))
        // Output files
        .pipe($.size({title: 'scripts'}))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('dist/scripts'))
  );

  // Compile and automatically prefix stylesheets
  gulp.task('styles', () => {

    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
      'core/styles/scss/**/*.scss',
      'core/styles/**/*.css'
    ])
      .pipe($.newer('.tmp/styles'))
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        precision: 5
      }).on('error', $.sass.logError))
      .pipe(gulp.dest('.tmp/styles'))

      // Concatenate and minify styles
      .pipe($.if('*.css', $.cssnano()))
      .pipe($.size({title: 'styles'}))
      .pipe(gulp.dest('dist/styles'));
  });

  // Scan your HTML for assets & optimize them
  gulp.task('html', () => {
    return gulp.src('core/**/*.html')
      .pipe($.useref({searchPath: '{.tmp,core}'}))
      .pipe($.if('*.css', $.uncss({
        html: [
          'core/index.html'
        ],
        // CSS Selectors for UnCSS to ignore
        ignore: []
      })))

      // Concatenate and minify styles
      // In case you are still using useref build blocks
      .pipe($.if('*.css', $.cssnano()))

      // Minify any HTML
      .pipe($.if('*.html', $.htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeOptionalTags: true
      })))
      // Output files
      .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
      .pipe(gulp.dest('dist'));
  });


  // Optimize images
  gulp.task('images', () =>
    gulp.src(paths.images)
      .pipe($.imagemin({
        progressive: true,
        interlaced: true
      }))
      .pipe(gulp.dest('dist/images'))
      .pipe($.size({title: 'images'}))
  );

  // Copy all files at the root level (app)
  gulp.task('copy', () =>
    gulp.src([
      'core/*',
      '!core/*.html',
    ], {
      dot: true
    }).pipe(gulp.dest('dist'))
      .pipe($.size({title: 'copy'}))
  );

  // Run PageSpeed Insights
  gulp.task('pagespeed-mobile', cb =>
    pagespeed(site, {
      strategy: 'mobile'
    }, cb)
  );
  gulp.task('pagespeed-desktop', cb =>
    pagespeed(site, {
      strategy: 'desktop'
    }, cb)
  );

  // Watch files
  gulp.task('serve', ['styles', 'scripts'], () => {
    browserSync({
      notify: false,
      logPrefix: 'Brahma',
      scrollElementMapping: ['main'],
      server: ['.tmp', 'core'],
      port: 8000
    });

    gulp.watch([paths.html], reload);
    gulp.watch([paths.styles], ['styles', reload]);
    gulp.watch([paths.scripts], ['lint', 'scripts']);
    gulp.watch([paths.images], reload);
  });

  // Build and serve the output from the dist build
  gulp.task('serve:dist', ['default'], () =>
    browserSync({
      notify: false,
      logPrefix: 'Brahma',
      scrollElementMapping: ['main'],
      server: 'dist',
      port: 8001
    })
  );

  // Build production files, the default task
  gulp.task('default', ['clean'], cb =>
    runSequence(
      'styles',
      ['lint', 'html', 'scripts', 'images', 'copy']
    )
  );

  // Clean output directory
  gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));
