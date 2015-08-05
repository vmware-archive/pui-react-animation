var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

gulp.task('spec', callback => runSequence('lint', 'jasmine-ci', callback));

function testAssets(options = {}) {
  var webpackConfig = require('../config/webpack');
  webpackConfig = {...webpackConfig, ...options};
  return gulp.src('spec/**/*_spec.js')
    .pipe(plugins.plumber())
    .pipe(plugins.webpack(webpackConfig));
}

gulp.task('jasmine-ci', function() {
  return testAssets({watch: false})
    .pipe(plugins.jasmineBrowser.specRunner({console: true}))
    .pipe(plugins.jasmineBrowser.headless());
});

gulp.task('jasmine', function() {
  var plugin = new (require('gulp-jasmine-browser/webpack/jasmine-plugin'))();
  return testAssets({plugins: [plugin]})
    .pipe(plugins.jasmineBrowser.specRunner())
    .pipe(plugins.jasmineBrowser.server());
});