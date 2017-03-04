import * as Easing from 'easing-js';
import now from 'performance-now';
import raf from 'raf';

const privates = new WeakMap();

function isNumber(obj) {
  return typeof obj === 'number' && !Number.isNaN(obj);
}

function strip(number) {
  return parseFloat(number.toPrecision(12));
}

function someAnimating(animations) {
  return Object.values(animations).some(animation => animation.isAnimating);
}

function reset() {
  privates.delete(this);
}

export default function injector({injectedRaf = raf, injectedNow = now, injectedEasing = Easing} = {}) {
  function getEasing(easing) {
    return typeof easing === 'function' ? easing : injectedEasing[easing];
  }

  function scheduleAnimation(context) {
    injectedRaf(() => {
      const animations = privates.get(context);
      if (!animations) return;
      const currentTime = injectedNow();
      const shouldForceUpdate = Object.values(animations).reduce((shouldForceUpdate, animation) => {
        if (!animation.isAnimating) return shouldForceUpdate;

        const {duration, easing, endValue, startTime, startValue, nameFn} = animation;

        const deltaTime = currentTime - startTime;
        if (deltaTime >= duration) {
          Object.assign(animation, {isAnimating: false, startTime: currentTime, value: endValue});
        } else {
          animation.value = strip(easing(deltaTime, startValue, endValue - startValue, duration));
        }

        if (nameFn) nameFn(animation.value);
        return shouldForceUpdate || !nameFn;
      }, false);

      if (animations && someAnimating(animations)) scheduleAnimation(context);
      if (shouldForceUpdate) context.forceUpdate();
    });
  }

  return Object.assign(function animate(name, endValue, duration, options = {}) {
    let animations = privates.get(this);
    if (!animations) privates.set(this, animations = {});

    let animation = animations[name];
    const shouldAnimate = (this.shouldAnimate ? this.shouldAnimate() : true) && options.animation !== false;

    if (!animation || !shouldAnimate || !isNumber(endValue)) {
      const easing = getEasing(options.easing || 'linear');
      const startValue = isNumber(options.startValue) && shouldAnimate ? options.startValue : endValue;
      const nameFn = typeof name === 'function' && name;
      animation = {duration, easing, endValue, isAnimating: false, startValue, value: startValue, nameFn};
      animations[name] = animation;
    }

    if (!duration) {
      Object.assign(animation, {endValue, value: endValue});
      animations[name] = animation;
    }

    if (animation.value !== endValue && !animation.isAnimating) {
      if (!someAnimating(animations)) scheduleAnimation(this);
      const startTime = 'startTime' in options ? options.startTime : injectedNow();
      duration = duration || animation.duration;
      const easing = getEasing(options.easing || animation.easing);
      const startValue = animation.value;
      const nameFn = typeof name === 'function' && name;
      Object.assign(animation, {isAnimating: true, endValue, startValue, startTime, duration, easing, nameFn});
    }

    return animation.value;
  }, {reset});
}