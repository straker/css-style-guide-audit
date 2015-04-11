var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');
var karma = require('karma').server;
var autoprefixer = require('gulp-autoprefixer');

function swallowError(error) {
  this.emit('end');
}

gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter( 'jshint-stylish' ));
});

gulp.task('test', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

gulp.task('scripts', function() {
  // auto-prefix test css files
  gulp.src('test/css/*.css')
    .pipe(autoprefixer())
    .pipe(gulp.dest('test/css'));

  // index.test.js is used in the test code to have access to all private function/variables
  // index.js is the unminified output
  // index.min.js is what's hosted on Dropbox and is used by the bookmarklet script
  gulp.src(['src/core.js', 'node_modules/specificity/specificity.js', 'src/*.js', '!src/run.js', '!src/bookmarkletCore.js'])
    .pipe(concat('index.test.js'))
    .pipe(gulp.dest('.'))
    .pipe(rename('index.js'))
    .pipe(concat.header('(function(window, document) {\n\'use strict\';\n'))
    .pipe(concat.footer('\n\n})(window, document);'))
    .pipe(size())
    .pipe(gulp.dest('.'))
    .pipe(rename('index.min.js'))
    // prevent IIFE from starting with !, which breaks bookmarklet return value
    .pipe(uglify({compress: {negate_iife: false}}))
    .pipe(size())
    .pipe(gulp.dest('.'))

  // create the bookmarklet code
  return gulp.src(['src/bookmarkletCore.js', 'src/run.js'])
    .pipe(concat('bookmarklet.js'))
    .pipe(concat.header('(function(document) {\n\'use strict\';\n'))
    .pipe(concat.footer('\n\n})(document);'))
    // prevent IIFE from starting with !, which breaks bookmarklet return value
    .pipe(uglify({compress: {negate_iife: false}}))
    .pipe(concat.header('javascript:'))
    .pipe(gulp.dest('.'));

  // return;

  // index.run.js includes the run script for running the code
  // return gulp.src(['src/core.js', 'node_modules/specificity/specificity.js', 'src/*.js'])
  //   .pipe(concat('index.js'))

});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['lint', 'scripts']);
});

gulp.task('default', ['lint', 'scripts', 'test', 'watch']);