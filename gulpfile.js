var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');

gulp.task('scripts', function() {
  gulp.src('static/js/*.js')
    .pipe(browserify({
      require: 'https'
    }))
    .pipe(uglify())
    // Concat, just to rename for now.
    .pipe(concat('js.min.js'))
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
    .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(gulp.dest('./static/build'));
});

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch('static/**/*', ['css', 'scripts']);

});

gulp.task('default', ['scripts', 'css']);
