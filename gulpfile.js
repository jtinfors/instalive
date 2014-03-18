var gulp = require('gulp');

var browserify = require('gulp-browserify');

gulp.task('default', function() {
  gulp.src('client/js/main.js').pipe(browserify({
    insertGlobals : true,
    debug : !gulp.env.production
  })).pipe(gulp.dest('./public/js'))
});

