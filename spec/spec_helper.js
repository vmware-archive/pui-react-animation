require('babel/polyfill');

var React = require('react/addons');
var jQuery = require('jquery');
var MockRaf = require('raf');
var MockNow = require('performance-now');


Object.assign(global, {
  $: jQuery,
  jQuery,
  MockRaf,
  MockNow,
  React
});

require('jasmine_dom_matchers');

beforeEach(function() {
  $('body').find('#root').remove().end().append('<main id="root"/>');
});

afterEach(function() {
  MockNow.reset();
  MockRaf.reset();
});
