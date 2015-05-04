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
    describe('when animating one property', function() {
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
  });
});