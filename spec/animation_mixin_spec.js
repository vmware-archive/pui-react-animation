require('./spec_helper');

describe('AnimationMixin', function() {
  var AnimationMixin, subject;
  beforeEach(function() {
    AnimationMixin = require('../src/animation_mixin');
    var Klass = React.createClass({
      mixins: [AnimationMixin],
      propTypes: {
        x: React.PropTypes.number,
        y: React.PropTypes.number
      },
      render() {
        var x = this.animate('x', this.props.x, 1000, {easing: 'linear'});
        var y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
        return <form><label>{x}</label><em>{y}</em></form>;
      }
    });
    subject = React.render(<Klass x={0} y={0}/>, root);
  });

  afterEach(function() {
    React.unmountComponentAtNode(root);
  });

  describe('#animate', function() {
    describe('when animating a function', function() {
      var animateSpy;
      beforeEach(function() {
        MockNow.reset();
        animateSpy = jasmine.createSpy('animate');
        var Klass = React.createClass({
          mixins: [AnimationMixin],
          click() {
            this.animate(animateSpy, 100, 1000, {startValue: 0});
          },
          render() {
            return (<div onClick={this.click}/>);
          }
        });
        subject = React.render(<Klass/>, root);
        $(subject.getDOMNode()).simulate('click');
        MockRaf.next();
      });

      it('starts animating from the startValue position', function() {
        expect(animateSpy).toHaveBeenCalledWith(0);
      });

      it('animates to the endValue', function() {
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

      it('stops animating after reaching the endValue', function() {
        MockNow.tick(1000);
        MockRaf.next();

        animateSpy.calls.reset();
        MockNow.tick(100);
        MockRaf.next();
        expect(animateSpy).not.toHaveBeenCalled();
      });
    });

    describe('when animating a property', function() {
      describe('when it has an optional start value', function() {
        beforeEach(function() {
          MockNow.reset();
          var Klass = React.createClass({
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            mixins: [AnimationMixin],
            render() {
              var x = this.animate('x', this.props.x, 1000, {easing: 'linear', startValue: 200});
              var y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = React.render(<Klass x={100} y={0}/>, root);
          MockNow.tick(100);
          MockRaf.next();
        });

        it('starts animating from the startValue position', function() {
          expect('label').toHaveText('190');
        });

        describe('when some time has passed', function() {
          beforeEach(function() {
            MockNow.tick(100);
            MockRaf.next();
          });

          it('renders at some interpolated animation position', function() {
            expect('label').toHaveText('180');
          });
        });
      });

      describe('when the end value is null', function() {
        beforeEach(function() {
          MockNow.reset();
          var Klass = React.createClass({
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            mixins: [AnimationMixin],
            render() {
              var x = this.animate('x', this.props.x, 1000, {easing: 'linear', startTime: 100});
              var y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = React.render(<Klass x={0} y={0}/>, root);
          MockRaf.calls.reset();
          subject.setProps({x: null});
        });

        it('does not animate', function() {
          expect(MockRaf).not.toHaveBeenCalled();
        });
      });

      describe('when it has an optional start time', function() {
        beforeEach(function() {
          MockNow.reset();
          var Klass = React.createClass({
            propTypes: {
              x: React.PropTypes.number,
              y: React.PropTypes.number
            },
            mixins: [AnimationMixin],
            render() {
              var x = this.animate('x', this.props.x, 1000, {easing: 'linear', startTime: 100});
              var y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
              return <form><label>{x}</label><em>{y}</em></form>;
            }
          });
          subject = React.render(<Klass x={0} y={0}/>, root);
          subject.setProps({x: 100});
          MockNow.tick(100);
          MockRaf.next();
        });

        it('renders in the start animation position', function() {
          expect('label').toHaveText('0');
        });
      });

      describe('when the property changes', function() {
        beforeEach(function() {
          subject.setProps({x: 100});
        });

        it('renders in the start animation position', function() {
          expect('label').toHaveText('0');
        });

        describe('when some time has passed', function() {
          beforeEach(function() {
            MockNow.tick(500);
            MockRaf.next();
          });

          it('renders at some interpolated animation position', function() {
            expect('label').toHaveText('50');
          });

          describe('when the duration time has passed', function() {
            beforeEach(function() {
              MockNow.tick(500);
              MockRaf.next();
            });

            it('renders in the end animation position', function() {
              expect('label').toHaveText('100');
            });
          });
        });

        describe('when the duration time has passed', function() {
          beforeEach(function() {
            MockNow.tick(1000);
            MockRaf.next();
          });

          it('renders in the end animation position', function() {
            expect('label').toHaveText('100');
          });

          describe('when animating the property again', function() {
            beforeEach(function() {
              MockRaf.calls.reset();
              subject.setProps({x: 0});
            });

            it('schedules an animation', function() {
              expect(MockRaf).toHaveBeenCalled();
            });

            describe('for the next animation frame', function() {
              beforeEach(function() {
                MockRaf.next();
              });

              it('animates from the previous start value', function() {
                expect('label').toHaveText('100');
              });

              describe('when some time has passed', function() {
                beforeEach(function() {
                  MockNow.tick(500);
                  MockRaf.next();
                });

                it('animates to the expected value', function() {
                  expect('label').toHaveText('50');
                });
              });
            });
          });
        });

        describe('when calling animate with a value', function() {
          var result;
          beforeEach(function() {
            result = subject.animate('x', 200);
          });

          it('returns the value', function() {
            expect(result).toEqual(200);
          });

          describe('when the duration time has passed', function() {
            beforeEach(function() {
              MockNow.tick(1000);
              MockRaf.next();
            });

            it('cancels any existing animation', function() {
              expect('label').toHaveText('200');
            });
          });
        });
      });
    });

    describe('when animating more than one property', function() {
      describe('when the properties change', function() {
        beforeEach(function() {
          subject.setProps({x: 100, y: 100});
        });

        it('renders in the start animation position', function() {
          expect('label').toHaveText('0');
          expect('em').toHaveText('0');
        });

        describe('when some time has passed', function() {
          beforeEach(function() {
            MockNow.tick(500);
            MockRaf.next();
          });

          it('renders at some interpolated animation position', function() {
            expect('label').toHaveText('50');
            expect('em').toHaveText('50');
          });
        });
      });
    });

    describe('when the animations are released from memory', function() {
      beforeEach(function() {
        MockNow.reset();
        var Klass = React.createClass({
          propTypes: {
            x: React.PropTypes.number,
            y: React.PropTypes.number
          },
          mixins: [AnimationMixin],
          render() {
            var x = this.animate('x', this.props.x, 1000, {easing: 'linear', startValue: 200});
            var y = this.animate('y', this.props.y, 1000, {easing: 'linear'});
            return <form><label>{x}</label><em>{y}</em></form>;
          }
        });
        subject = React.render(<Klass x={100} y={0}/>, root);
        MockNow.tick(100);
        MockRaf.next();
        React.unmountComponentAtNode(root);
      });

      it('does not crash in the next animation frame', function() {
        expect(() => MockRaf.next()).not.toThrow();
      });
    });
  });
});