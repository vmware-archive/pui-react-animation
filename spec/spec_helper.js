require('babel-polyfill');

var React = require('react');
var ReactDOM = require('react-dom');
var jQuery = require('jquery');
var MockRaf = require('raf');
var MockNow = require('performance-now');

require('jasmine_dom_matchers');

Object.assign(global, {
  $: jQuery,
  jQuery,
  MockRaf,
  MockNow,
  React,
  ReactDOM
}, require('./support/react_helper'));

beforeEach(function() {
  $('body').find('#root').remove().end().append('<main id="root"/>');
});

afterEach(function() {
  MockNow.reset();
  MockRaf.reset();
});
