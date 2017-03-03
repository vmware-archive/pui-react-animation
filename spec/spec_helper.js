import 'babel-polyfill';
import 'jasmine_dom_matchers';
import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import MockRaf from 'raf';
import MockNow from 'performance-now';
import {setProps} from 'pivotal-js-react-test-helpers';

Object.assign(global, {$: jQuery, jQuery});

beforeEach(() => {
  $('body').find('#root').remove().end().append('<main id="root"/>');
});

afterEach(() => {
  MockNow.reset();
  MockRaf.reset();
});

export {React, ReactDOM, MockRaf, MockNow, setProps};