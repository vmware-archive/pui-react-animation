const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const jQuery = require('jquery');

(function($) {
  $.fn.simulate = function(eventName, ...args) {
    if (!this.length) {
      throw new Error(`jQuery Simulate has an empty selection for '${this.selector}'`);
    }
    $.each(this, function() {
      if (['mouseOver', 'mouseOut'].includes(eventName)) {
        TestUtils.SimulateNative[eventName](this, ...args);
      } else {
        TestUtils.Simulate[eventName](this, ...args);
      }
    });
    return this;
  };
})(jQuery);

module.exports = {
  withContext(...args) {
    let [context, props, callback, node] = args;
    if (typeof props === 'function') {
      node = callback;
      callback = props;
      props = {};
    }
    const childContextTypes = Object.keys(context).reduce((memo, key) => (memo[key] = React.PropTypes.any, memo), {});
    const Context = React.createClass({
      childContextTypes,
      getChildContext: () => context,
      render() {
        return (<div {...props}>{callback.call(this)}</div>);
      }
    });
    return ReactDOM.render(<Context {...props}/>, node || root);
  },

  setProps(props, node = root) {
    const Component = this.constructor;
    ReactDOM.render(<Component {...this.props} {...props}/>, node);
  }
};