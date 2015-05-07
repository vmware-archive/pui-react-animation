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

$.fn.simulate = function(eventName, ...args) {
  if (!this.length) {
    throw new Error(`jQuery Simulate has an empty selection for '${this.selector}'`);
  }
  $.each(this, function() {
    if (['mouseOver', 'mouseOut', 'click'].includes(eventName)) {
      React.addons.TestUtils.SimulateNative[eventName](this, ...args);
    } else {
      React.addons.TestUtils.Simulate[eventName](this, ...args);
    }
  });
  return this;
};

beforeEach(function() {
  $('body').find('#root').remove().end().append('<main id="root"/>');
});

afterEach(function() {
  MockNow.reset();
  MockRaf.reset();
});
