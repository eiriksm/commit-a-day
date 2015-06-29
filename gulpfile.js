'use strict';
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');

gulp.task('scripts', function() {
  browserify('./static/js/browser.js')
    .require('https')
    .bundle()
    .pipe(source('js.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./static/build'));
});

gulp.task('css', function() {
  gulp.src('static/scss/style.scss')
    .pipe(sass({
      outputStyle: 'compressed',
      errLogToConsole: true,
      error: function(err) {
        console.log(err);
      }
    }))
    .pipe(prefix('last 1 version', '> 1%', 'ie 8', 'ie 7'))
    .pipe(gulp.dest('./static/build'));
});

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('static/**/*', ['css', 'scripts']);

});

gulp.task('default', ['scripts', 'css']);
