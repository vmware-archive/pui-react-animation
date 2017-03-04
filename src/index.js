import injector from './injector';

const animate = injector();

export default  {
  componentWillUnmount: animate.reset,
  animate,
  shouldAnimate: () => true
};