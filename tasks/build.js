import del from 'del';
import gulp from 'gulp';
import mergeStream from 'merge-stream';
import babel from 'gulp-babel';
import header from 'gulp-header';
import runSequence from 'run-sequence';

const COPYRIGHT = '//(c) Copyright 2015 Pivotal Software, Inc. All Rights Reserved.\n';

gulp.task('clean', function(callback) {
  del('dist', callback);
});

gulp.task('build', function(callback) {
  runSequence('clean', 'babel', callback);
});

gulp.task('babel', function() {
  return mergeStream(
    gulp.src('src/**/*.js').pipe(babel()).pipe(header(COPYRIGHT)),
    gulp.src(['LICENSE', 'README.md', 'package.json'])
  ).pipe(gulp.dest('dist'));
});

gulp.task('build', function(callback) {
  runSequence('clean', 'babel', callback);
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*.js', ['babel']);
});