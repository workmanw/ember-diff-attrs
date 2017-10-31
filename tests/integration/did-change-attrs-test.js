import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { DidChangeAttrs } from 'ember-diff-attrs';

function registerComponent(testSuite, hash, klass = Ember.Component) {
  testSuite.register('component:x-changer', klass.extend(DidChangeAttrs, hash));
}

moduleForComponent('x-changer', 'Integration | DidChangeAttrs', {
  integration: true
});

test('Basic usage', function(assert) {
  let changedAttrs, didChangeAttrsCallCount = 0;

  registerComponent(this, {
    didChangeAttrsConfig: {
      attrs: ['email', 'isAdmin']
    },

    didChangeAttrs(changes) {
      didChangeAttrsCallCount++;
      changedAttrs = changes;
    }
  });

  this.set('name', 'Tomster');
  this.set('email', 'ember@hamster.org');
  this.set('isAdmin', false);

  this.render(hbs`{{x-changer email=email isAdmin=isAdmin name=name}}`);
  assert.equal(didChangeAttrsCallCount, 0, '`didChangeAttrs` is not called on initial render');

  this.set('email', 'emberjs@hamster.org');
  assert.equal(didChangeAttrsCallCount, 1, '`didChangeAttrs` is called when an attribute changed');

  assert.deepEqual(changedAttrs, {
    email: {
      previous: 'ember@hamster.org',
      current: 'emberjs@hamster.org'
    }
  }, '`changedAttrs` contains the attribute changes');

  this.set('name', 'TheTomster');
  assert.equal(didChangeAttrsCallCount, 1, '`didChangeAttrs` is not called when an untracked attribute is changed');
});
