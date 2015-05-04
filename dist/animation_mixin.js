'use strict';

var Easing = require('easing-js');
var now = require('performance-now');
var raf = require('raf');

function isNumber(obj) {
  return typeof obj === 'number' && !Number.isNaN(obj);
}

function strip(number) {
  return parseFloat(number.toPrecision(12));
}

function someAnimating(animations) {
  return Object.keys(animations).some(function (name) {
    return animations[name].isAnimating;
  });
}

function scheduleAnimation(context) {
  raf(function () {
    var animations = context._animations;
    var currentTime = now();
    var shouldUpdate = false;
    Object.keys(animations).forEach(function (name) {
      var animation = animations[name];
      if (!animation.isAnimating) return;

      var duration = animation.duration;
      var easing = animation.easing;
      var endValue = animation.endValue;
      var startTime = animation.startTime;
      var startValue = animation.startValue;
      var value = animation.value;

      var deltaTime = currentTime - startTime;
      if (deltaTime >= duration) {
        Object.assign(animation, { isAnimating: false, startTime: currentTime, startValue: value, value: endValue });
        shouldUpdate = true;
        return;
      }
      animation.value = strip(Easing[easing](deltaTime, startValue, endValue - startValue, duration));
      shouldUpdate = true;
    });

    if (shouldUpdate) context.forceUpdate();
    if (someAnimating(animations)) scheduleAnimation(context);
  });
}

var AnimationMixin = {
  componentWillUnmount: function componentWillUnmount() {
    this._animations = null;
  },

  shouldAnimate: function shouldAnimate() {
    return true;
  },

  animate: function animate(name, endValue, duration) {
    var options = arguments[3] === undefined ? {} : arguments[3];

    this._animations = this._animations || {};

    var animations = this._animations;

    var animation = animations[name];
    var shouldAnimate = this.shouldAnimate() && options.animation !== false;
    if (!animation || !shouldAnimate || !isNumber(endValue)) {
      var easing = options.easing || 'linear';
      var startValue = isNumber(options.startValue) && shouldAnimate ? options.startValue : endValue;
      animation = { duration: duration, easing: easing, endValue: endValue, isAnimating: false, startValue: startValue, value: startValue };
      animations[name] = animation;
    }

    if (animation.value !== endValue && !animation.isAnimating) {
      if (!someAnimating(animations)) scheduleAnimation(this);
      var startTime = 'startTime' in options ? options.startTime : now();
      Object.assign(animation, { isAnimating: true, value: animation.startValue, endValue: endValue, startTime: startTime });
    }

    return animation.value;
  }
};

module.exports = AnimationMixin;