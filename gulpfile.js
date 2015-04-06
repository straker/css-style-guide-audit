var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');

function swallowError(error) {
  this.emit('end');
}

gulp.task('lint', function() {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter( 'jshint-stylish' ));
});

gulp.task('scripts', function() {
  return gulp.src(['src/core.js', 'node_modules/specificity/specificity.js', 'src/*.js', 'src/final.js'])
    .pipe(concat('index.js'))
    .pipe(concat.header('(function(window, document) {\n\'use strict\';\n'))
    .pipe(concat.footer('\n\n})(window, document);'))
    .pipe(size())
    .pipe(gulp.dest('.'))
    .pipe(rename('index.min.js'))
    .pipe(uglify())
    .pipe(size())
    .pipe(gulp.dest('.'))
    .pipe(rename('bookmarklet.js'))
    .pipe(concat.header('javascript:'))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['lint', 'scripts']);
});

gulp.task('default', ['lint', 'scripts', 'watch']);