import injector from './injector';

const animate = injector();

export default  {
  componentWillUnmount: animate.componentWillUnmount,
  animate,
  shouldAnimate: () => true
};