var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var watch = require('gulp-watch');

gulp.task('js', function () {
	browserify('./public/src/js/main.js')
	.transform('babelify', {presets: ['es2015']})
	.bundle()
	.pipe(source('bundle.js'))
	.pipe(gulp.dest('./public/js'));
});

gulp.task('watch', function (cb) {
	watch('./public/src/**/*.js', function () {
		gulp.src('public/src/js/**/*.js')
            .pipe(watch('public/src/js/**/*.js'))
            .on('end', cb);
	});
});

gulp.task('default', ['js']);