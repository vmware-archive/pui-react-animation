const Easing = require('easing-js');

const privates = new WeakMap();

function isNumber(obj) {
  return typeof obj === 'number' && !Number.isNaN(obj);
}

function strip(number) {
  return parseFloat(number.toPrecision(12));
}

function someAnimating(animations) {
  for (const [, animation] of animations) {
    if (animation.isAnimating) return true;
  }
  return false;
}

function scheduleAnimation(context) {
  AnimationMixin.raf(function() {
    const animations = privates.get(context);
    const currentTime = AnimationMixin.now();
    let shouldUpdate = false;
    animations && animations.forEach(function(animation, name) {
      const isFunction = typeof name === 'function';
      if (!animation.isAnimating) return;

      const {duration, easing, endValue, startTime, startValue} = animation;

      const deltaTime = currentTime - startTime;
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

const AnimationMixin = {
  componentWillUnmount() {
    privates.delete(this);
  },

  shouldAnimate() {
    return true;
  },

  raf: require('raf'),

  now: require('performance-now'),

  animate(name, endValue, duration, options = {}) {
    let animations = privates.get(this);
    if (!animations) {
      privates.set(this, animations = new Map());
    }

    let animation = animations.get(name);
    const shouldAnimate = this.shouldAnimate() && options.animation !== false;
    if (!animation || !shouldAnimate || !isNumber(endValue)) {
      const easing = options.easing || 'linear';
      const startValue = isNumber(options.startValue) && shouldAnimate ? options.startValue : endValue;
      animation = {duration, easing, endValue, isAnimating: false, startValue, value: startValue};
      animations.set(name, animation);
    }

    if (!duration) {
      Object.assign(animation, {endValue, value: endValue});
      animations.set(name, animation);
    }

    if (animation.value !== endValue && !animation.isAnimating) {
      if (!someAnimating(animations)) scheduleAnimation(this);
      const startTime = 'startTime' in options ? options.startTime : AnimationMixin.now();
      duration = duration || animation.duration;
      const easing = options.easing || animation.easing;
      const startValue = animation.value;
      Object.assign(animation, { isAnimating: true, endValue, startValue, startTime, duration, easing});
    }

    return animation.value;
  }
};

module.exports = AnimationMixin;