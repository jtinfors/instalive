var gulp = require('gulp');

gulp.task('default', function() {
  // place code for your default task here
});

var browserify = require('gulp-browserify');

gulp.task('scripts', function() {
  gulp.src('client/js/main.js').pipe(browserify({
    insertGlobals : true,
    debug : !gulp.env.production
  })).pipe(gulp.dest('./public/js'))
});

