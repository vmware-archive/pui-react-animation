import {MockNow, MockRaf, React, ReactDOM, setProps} from './spec_helper';
import AnimationMixin from '../src/animation_mixin';

describe('AnimationMixin', () => {
  let subject;

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(root);
  });

  describe('#animate', () => {
    describe('when the end value of the animation changes whenever it renders', () => {
      beforeEach(() => {
        let counter = 1;
        const Klass = React.createClass({
          mixins: [AnimationMixin],

          render() {
            const time = this.animate('time', counter++, 1000, {easing: 'linear'});
            return <form><label>{time}</label></form>;
          }
        });
        subject = ReactDOM.render(<Klass/>, root);
      });

      it('renders in the start animation position', () => {
        expect('label').toHaveText('1');
      });

      it('does not animate', () => {
        expect(MockRaf).not.toHaveBeenCalled();
      });

      describe('when the component is re-rendered', () => {
        beforeEach(() => {
          subject::setProps({id: 'id'});
          MockNow.tick(1000);
          MockRaf.next();
        });

        it('animates', () => {
          expect(MockRaf.calls.count()).toBe(2);
          expect(MockRaf).toHaveBeenCalled();
        });

        it('animates the value to the next count', () => {
          expect('label').toHaveText('2');
        });
      });
    });

    describe('when animating a function', () => {
      let animateSpy;
      beforeEach(() => {
        MockNow.reset();
        animateSpy = jasmine.createSpy('animate');
        const Klass = React.createClass({
          mixins: [AnimationMixin],
          click() {
            this.animate(animateSpy, 100, 1000, {startValue: 0});
          },
          render() {
            return (<div onClick={this.click}/>);
          }
        });
        subject = ReactDOM.render(<Klass/>, root);
        $(ReactDOM.findDOMNode(subject)).simulate('click');
        MockRaf.next();
      });

      it('starts animating from the startValue position', () => {
        expect(animateSpy).toHaveBeenCalledWith(0);
      });

      it('animates to the endValue', () => {
        animateSpy.calls.reset();
        MockNow.tick(100);
        MockRaf.next();
        expect(animateSpy).toHaveBeenCalledWith(10);

        animateSpy.calls.reset();
        MockNow.tick(400);
        MockRaf.next();
        expect(animateSpy).toHaveBeenCalledWith(50);

        animateSpy.calls.reset();
        MockNow.tick(500);
        MockRaf.next();
        expect(animateSpy).toHaveBeenCalledWith(100);
      });

      it('stops animating after reaching the endValue', () => {
        MockNow.tick(1000);
        MockRaf.next();

        animateSpy.calls.reset();
        MockNow.tick(100);
        MockRaf.next();
        expect(animateSpy).not.toHaveBeenCalled();
      });
    });

    describe('when animating a property', () => {
      describe('when it has an optional start value', () => {
        beforeEach(() => {
          MockNow.reset();
          const Klass = React.createClass({
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            mixins: [AnimationMixin],
            render() {
              const x = this.animate('x', this.props.x, 1000, {easing: 'linear', startValue: 200});
              const y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = ReactDOM.render(<Klass x={100} y={0}/>, root);
          MockNow.tick(100);
          MockRaf.next();
        });

        it('starts animating from the startValue position', () => {
          expect('label').toHaveText('190');
        });

        describe('when some time has passed', () => {
          beforeEach(() => {
            MockNow.tick(100);
            MockRaf.next();
          });

          it('renders at some interpolated animation position', () => {
            expect('label').toHaveText('180');
          });
        });
      });

      describe('when the end value is null', () => {
        beforeEach(() => {
          MockNow.reset();
          const Klass = React.createClass({
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            mixins: [AnimationMixin],
            render() {
              const x = this.animate('x', this.props.x, 1000, {easing: 'linear', startTime: 100});
              const y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = ReactDOM.render(<Klass x={0} y={0}/>, root);
          MockRaf.calls.reset();
          subject::setProps({x: null});
        });

        it('does not animate', () => {
          expect(MockRaf).not.toHaveBeenCalled();
        });
      });

      describe('when it has an optional start time', () => {
        beforeEach(() => {
          MockNow.reset();
          const Klass = React.createClass({
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            mixins: [AnimationMixin],
            render() {
              const x = this.animate('x', this.props.x, 1000, {easing: 'linear', startTime: 100});
              const y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = ReactDOM.render(<Klass x={0} y={0}/>, root);
          subject::setProps({x: 100});
          MockNow.tick(100);
          MockRaf.next();
        });

        it('renders in the start animation position', () => {
          expect('label').toHaveText('0');
        });
      });

      describe('when the property changes', () => {
        beforeEach(() => {
          const Klass = React.createClass({
            mixins: [AnimationMixin],
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            render() {
              const x = this.animate('x', this.props.x, 1000, {easing: 'linear'});
              const y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = ReactDOM.render(<Klass x={0} y={0}/>, root);
          subject::setProps({x: 100});
        });

        it('renders in the start animation position', () => {
          expect('label').toHaveText('0');
        });

        describe('when some time has passed', () => {
          beforeEach(() => {
            MockNow.tick(500);
            MockRaf.next();
          });

          it('renders at some interpolated animation position', () => {
            expect('label').toHaveText('50');
          });

          describe('when the duration time has passed', () => {
            beforeEach(() => {
              MockNow.tick(500);
              MockRaf.next();
            });

            it('renders in the end animation position', () => {
              expect('label').toHaveText('100');
            });
          });
        });

        describe('when the duration time has passed', () => {
          beforeEach(() => {
            MockNow.tick(1000);
            MockRaf.next();
          });

          it('renders in the end animation position', () => {
            expect('label').toHaveText('100');
          });

          describe('when animating the property again', () => {
            beforeEach(() => {
              MockRaf.calls.reset();
              subject::setProps({x: 0});
            });

            it('schedules an animation', () => {
              expect(MockRaf).toHaveBeenCalled();
            });

            describe('for the next animation frame', () => {
              beforeEach(() => {
                MockRaf.next();
              });

              it('animates from the previous start value', () => {
                expect('label').toHaveText('100');
              });

              describe('when some time has passed', () => {
                beforeEach(() => {
                  MockNow.tick(500);
                  MockRaf.next();
                });

                it('animates to the expected value', () => {
                  expect('label').toHaveText('50');
                });
              });
            });
          });
        });

        describe('calling animate with a value but no duration while that animation is in progress', () => {
          let result;
          beforeEach(() => {
            result = subject.animate('x', 200);
          });

          it('returns the value', () => {
            expect(result).toEqual(200);
          });

          describe('when the duration time has passed', () => {
            beforeEach(() => {
              MockNow.tick(1000);
              MockRaf.next();
            });

            it('cancels any existing animation', () => {
              expect('label').toHaveText('200');
            });
          });
        });
      });

      describe('when easing is a function instead of a string', () => {
        let easingSpy;
        beforeEach(() => {
          easingSpy = jasmine.createSpy('easing').and.callFake((t, b, c, d) => {
            return c * t / d + b;
          });
          const Klass = React.createClass({
            mixins: [AnimationMixin],
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            render() {
              const x = this.animate('x', this.props.x, 1000, {easing: easingSpy});
              const y = this.animate('y', this.props.y, 1000, {easing: easingSpy});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = ReactDOM.render(<Klass x={0} y={0}/>, root);
          subject::setProps({x: 100});
        });

        it('renders in the start animation position', () => {
          expect('label').toHaveText('0');
        });

        it('does not call the easing function', () => {
          expect(easingSpy).not.toHaveBeenCalled();
        });

        describe('when some time has passed', () => {
          beforeEach(() => {
            MockNow.tick(500);
            MockRaf.next();
          });

          it('renders at some interpolated animation position', () => {
            expect('label').toHaveText('50');
          });

          it('calls the easing function', () => {
            expect(easingSpy).toHaveBeenCalledWith(500, 0, 100, 1000);
          });

          describe('when the duration time has passed', () => {
            beforeEach(() => {
              MockNow.tick(500);
              easingSpy.calls.reset();
              MockRaf.next();
            });

            it('renders in the end animation position', () => {
              expect('label').toHaveText('100');
            });

            it('does not call the easing function', () => {
              expect(easingSpy).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe('when calling animate with a value but no duration on a new animation', () => {
        beforeEach(() => {
          const Klass = React.createClass({
            mixins: [AnimationMixin],
            propTypes: {
              x: React.PropTypes.number,
              duration: React.PropTypes.number
            },

            render() {
              const {duration} = this.props;
              const x = this.animate('x', this.props.x, duration);
              return <form><label>{x}</label></form>;
            }
          });
          subject = ReactDOM.render(<Klass x={100}/>, root);
        });

        it('renders in the end animation position', () => {
          expect('label').toHaveText('100');
        });

        describe('when that animation is used again', () => {
          const duration = 1000;
          beforeEach(() => {
            subject::setProps({duration, x: 0});
          });

          it('animates with the new duration', () => {
            expect('label').toHaveText('100');
            MockNow.tick(500);
            MockRaf.next();
            expect('label').toHaveText('50');
          });
        });
      });
    });

    describe('when animating more than one property', () => {
      beforeEach(() => {
        const Klass = React.createClass({
          mixins: [AnimationMixin],
          propTypes: {
            x: React.PropTypes.number,
            y: React.PropTypes.number
          },
          render() {
            const x = this.animate('x', this.props.x, 1000, {easing: 'linear'});
            const y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
            return <form><label>{x}</label><em>{y}</em></form>;
          }
        });
        subject = ReactDOM.render(<Klass x={0} y={0}/>, root);
      });
      describe('when the properties change', () => {
        beforeEach(() => {
          subject::setProps({x: 100, y: 100});
        });

        it('renders in the start animation position', () => {
          expect('label').toHaveText('0');
          expect('em').toHaveText('0');
        });

        describe('when some time has passed', () => {
          beforeEach(() => {
            MockNow.tick(500);
            MockRaf.next();
          });

          it('renders at some interpolated animation position', () => {
            expect('label').toHaveText('50');
            expect('em').toHaveText('50');
          });
        });
      });
    });

    describe('when the animations are released from memory', () => {
      beforeEach(() => {
        MockNow.reset();
        const Klass = React.createClass({
          propTypes: {
            x: React.PropTypes.number,
            y: React.PropTypes.number
          },
          mixins: [AnimationMixin],
          render() {
            const x = this.animate('x', this.props.x, 1000, {easing: 'linear', startValue: 200});
            const y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
            return <form><label>{x}</label><em>{y}</em></form>;
          }
        });
        subject = ReactDOM.render(<Klass x={100} y={0}/>, root);
        MockNow.tick(100);
        MockRaf.next();
        ReactDOM.unmountComponentAtNode(root);
      });

      it('does not crash in the next animation frame', () => {
        expect(() => MockRaf.next()).not.toThrow();
      });
    });
  });
});