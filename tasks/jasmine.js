import gulp from 'gulp';
import plumber from 'gulp-plumber';
import jasmineBrowser from 'gulp-jasmine-browser';
import webpack from 'webpack-stream';

function testAssets(options = {}) {
  let webpackConfig = require('../config/webpack.config');
  webpackConfig = {...webpackConfig, ...options};
  return gulp.src('spec/**/*_spec.js')
    .pipe(plumber())
    .pipe(webpack(webpackConfig));
}

gulp.task('spec', function() {
  return testAssets({watch: false})
    .pipe(jasmineBrowser.specRunner({console: true}))
    .pipe(jasmineBrowser.headless());
});

gulp.task('jasmine', function() {
  const plugin = new (require('gulp-jasmine-browser/webpack/jasmine-plugin'))();
  return testAssets({plugins: [plugin]})
    .pipe(jasmineBrowser.specRunner())
    .pipe(jasmineBrowser.server());
});
