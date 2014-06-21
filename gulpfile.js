var gulp = require('gulp'),
    uglify = require('gulp-uglify');

var browserify = require('gulp-browserify');

gulp.task('default', function() {
  gulp.src('client/js/image_client.js').pipe(browserify({
    insertGlobals : true,
    debug : !gulp.env.production
  }))
  .pipe(uglify({outSourceMap: true}))
  .pipe(gulp.dest('./public/js'));
});

