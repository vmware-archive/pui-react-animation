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
  return Object.keys(animations).some(name => animations[name].isAnimating);
}

function scheduleAnimation(context) {
  raf(function() {
    var animations = context._animations;
    var currentTime = now();
    var shouldUpdate = false;
    Object.keys(animations).forEach(function(name) {
      var animation = animations[name];
      if (!animation.isAnimating) return;

      var {duration, easing, endValue, startTime, startValue} = animation;

      var deltaTime = currentTime - startTime;
      if (deltaTime >= duration) {
        Object.assign(animation, {isAnimating: false, startTime: currentTime, value: endValue});
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
  componentWillUnmount() {
    this._animations = null;
  },

  shouldAnimate() {
    return true;
  },

  animate(name, endValue, duration, options = {}) {
    this._animations = this._animations || {};

    var animations = this._animations;

    var animation = animations[name];
    var shouldAnimate = this.shouldAnimate() && options.animation !== false;
    if (!animation || !shouldAnimate || !isNumber(endValue)) {
      var easing = options.easing || 'linear';
      var startValue = isNumber(options.startValue) && shouldAnimate ? options.startValue : endValue;
      animation = {duration, easing, endValue, isAnimating: false, startValue, value: startValue};
      animations[name] = animation;
    }

    if (animation.value !== endValue && !animation.isAnimating) {
      if (!someAnimating(animations)) scheduleAnimation(this);
      var startTime = 'startTime' in options ? options.startTime : now();
      Object.assign(animation, {isAnimating: true, endValue, startValue: animation.value, startTime});
    }

    return animation.value;
  }
};

module.exports = AnimationMixin;