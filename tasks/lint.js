import gulp from 'gulp';
import plumber from 'gulp-plumber';
import eslint from 'gulp-eslint';

gulp.task('lint', function() {
  return gulp.src(['gulpfile.js', 'tasks/**/*.js', 'src/**/*.js', 'spec/**/*.js'])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format('stylish'))
    .pipe(eslint.failOnError());
});