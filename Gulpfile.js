var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var watch = require('gulp-watch');

gulp.task('js', function () {
	browserify('./src/js/main.js')
	.transform('babelify', {presets: ['es2015']})
	.bundle()
	.pipe(source('bundle.js'))
	.pipe(gulp.dest('./public/js'));
});
gulp.task('watch', function () {
	gulp.watch('./src/js/**/*.js', ['js']);
});
gulp.task('default', ['js']);