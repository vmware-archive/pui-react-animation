var Easing = require('easing-js');
var now = require('performance-now');
var raf = require('raf');

var privates = new WeakMap();

function isNumber(obj) {
  return typeof obj === 'number' && !Number.isNaN(obj);
}

function strip(number) {
  return parseFloat(number.toPrecision(12));
}

function someAnimating(animations) {
  for (var [, animation] of animations) {
    if (animation.isAnimating) return true;
  }
  return false;
}

function scheduleAnimation(context) {
  raf(function() {
    var animations = privates.get(context);
    var currentTime = now();
    var shouldUpdate = false;
    animations && animations.forEach(function(animation, name) {
      var isFunction = typeof name === 'function';
      if (!animation.isAnimating) return;

      var {duration, easing, endValue, startTime, startValue} = animation;

      var deltaTime = currentTime - startTime;
      if (deltaTime >= duration) {
        Object.assign(animation, {isAnimating: false, startTime: currentTime, value: endValue});
      } else {
        animation.value = strip(Easing[easing](deltaTime, startValue, endValue - startValue, duration));
      }

      shouldUpdate = shouldUpdate || !isFunction;
      if (isFunction) name(animation.value);
    });

    if (animations && someAnimating(animations)) scheduleAnimation(context);
    if (shouldUpdate) context.forceUpdate();
  });
}

var AnimationMixin = {
  componentWillUnmount() {
    privates.delete(this);
  },

  shouldAnimate() {
    return true;
  },

  animate(name, endValue, duration, options = {}) {
    var animations = privates.get(this);
    if (!animations) {
      privates.set(this, animations = new Map());
    }

    var animation = animations.get(name);
    var shouldAnimate = this.shouldAnimate() && options.animation !== false;
    if (!animation || !shouldAnimate || !isNumber(endValue)) {
      var easing = options.easing || 'linear';
      var startValue = isNumber(options.startValue) && shouldAnimate ? options.startValue : endValue;
      animation = {duration, easing, endValue, isAnimating: false, startValue, value: startValue};
      animations.set(name, animation);
    }

    if (!duration) {
      Object.assign(animation, {endValue, value: endValue});
      animations.set(name, animation);
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