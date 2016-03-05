/* Global Require Gulp */
/***********************************/

(function (require) {

  // Variables
  var gulp = require('gulp');
  var watch = require('gulp-watch');
  var sass = require('gulp-sass');
  var gutil = require('gulp-util');
  var jshint = require('gulp-jshint');
  var connect = require('gulp-connect');
  var imagemin = require('gulp-imagemin');
  var useref = require('gulp-useref');
  var uglify = require('gulp-uglify');
  var concatFiles = require('gulp-concat');
  var changed = require('gulp-changed');
  var historyApiFallback = require('connect-history-api-fallback');
  var psi = require('psi');

  // URL Site
  var site = 'http://trimurti.github.io/brahma';

  // Assets Paths
  var paths = {
    html:    ['app/templates/**/*.html', 'app/index.html'],
    scripts: ['app/js/scripts.js'],
    styles:  ['app/src/scss/**/*.scss'],
    images:  ['app/images/**/*']
  };

  // Connection
  gulp.task('connect', function() {
    connect.server({
      root: 'app',
      livereload: true,
      port: 8000,
      middleware: function(connect, opt) {
        return [ historyApiFallback({}) ];
      }
    });
  });

  // Stylesheets
  gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(sass({outputStyle: 'expanded', errLogToConsole: true}))
    .pipe(concatFiles('styles.css'))
    .pipe(gulp.dest('app/css'))
    .pipe(connect.reload());
  });

  // HTML
  gulp.task('html', function () {
    return gulp.src(paths.html)
    .pipe(connect.reload());
  });

  // Imagemin
  gulp.task('imagemin', function() {
    var  imgSrc = paths.images,
            imgDst = 'app/images';
    gulp.src(imgSrc)
    .pipe(changed(imgDst))
    .pipe(imagemin())
    .pipe(gulp.dest(imgDst));
  });


  // JSHint
  gulp.task('jshint', function() {
    gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
  });

  // Pagespeed

  // Mobile
  gulp.task('psi-mobile', function (cb) {
    psi({
        nokey: 'true',
        url: site,
        strategy: 'mobile',
    }, cb);
  });

  // Desktop
  gulp.task('psi-desktop', function (cb) {
    psi({
        nokey: 'true',
        url: site,
        strategy: 'desktop',
    }, cb);
  });

  // Build Concat/Compile
  gulp.task('useref', function () {
    return gulp.src(paths.html)
    .pipe(useref())
    .pipe(gulp.dest('dist'));
  });

  // Build Fonts
  gulp.task('fonts', function() {
    gulp.src('app/fonts/**/*.{ttf,woff,eof,svg}')
    .pipe(gulp.dest('dist/fonts'));
  });

  // Observator
  gulp.task('watch', function() {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.styles, ['styles']);
  });

  // Run tasks
  gulp.task('default', [ 'html', 'useref', 'imagemin', 'styles', 'watch', 'connect' ]);

}(require));
