import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import diffAttrs from 'ember-diff-attrs';


function registerComponent(testSuite, hash, klass = Ember.Component) {
  testSuite.register('component:x-changer', klass.extend(hash));
}

moduleForComponent('x-changer', 'Integration | diffAttrs', {
  integration: true
});

test('Basic usage', function(assert) {
  let changedAttrs, changedInvokeCount = 0;
  registerComponent(this, {
    didReceiveAttrs: diffAttrs(['email', 'isAdmin'], function(changedAttrsArg) {
      changedAttrs = changedAttrsArg;
      changedInvokeCount++;
    })
  });

  this.set('name', 'Tomster');
  this.set('email', 'ember@hamster.org');
  this.set('isAdmin', false);

  this.render(hbs`{{x-changer email=email isAdmin=isAdmin name=name}}`);

  assert.equal(changedInvokeCount, 1, 'There is an invocation on init.');
  assert.equal(changedAttrs.email[0], undefined);
  assert.equal(changedAttrs.email[1], 'ember@hamster.org');
  assert.equal(changedAttrs.isAdmin[0], undefined);
  assert.equal(changedAttrs.isAdmin[1], false);

  this.set('email', 'emberjs@hamster.org');
  assert.equal(changedInvokeCount, 2, 'There is an invocation on update.');
  assert.equal(changedAttrs.email[0], 'ember@hamster.org');
  assert.equal(changedAttrs.email[1], 'emberjs@hamster.org');
  assert.notOk(changedAttrs.isAdmin);

  this.set('name', 'TheTomster');
  assert.equal(changedInvokeCount, 2, 'There was no invocation for update of non-observer attr.');
});

test('Calls `_super`', function(assert) {
  let superInvokeCount = 0, changedInvokeCount = 0;
  let SuperComponent = Ember.Component.extend({
    didReceiveAttrs() {
      superInvokeCount++;
    }
  });
  registerComponent(this, {
    didReceiveAttrs: diffAttrs(['email', 'isAdmin'], function() {
      changedInvokeCount++;
    })
  }, SuperComponent);

  this.set('name', 'Tomster');
  this.set('email', 'ember@hamster.org');

  this.render(hbs`{{x-changer email=email name=name}}`);

  assert.equal(superInvokeCount, 1, 'Super invoked on init.');
  assert.equal(changedInvokeCount, 1, 'Changed invoked on init.');

  this.set('email', 'emberjs@hamster.org');
  assert.equal(superInvokeCount, 2, 'Super invoked on change.');
  assert.equal(changedInvokeCount, 2, 'Changed invoked on change.');

  this.set('name', 'TheTomster');
  assert.equal(superInvokeCount, 3, 'Super invoked when there is no difference.');
  assert.equal(changedInvokeCount, 2, 'Changed not when there is no difference.');
});

test('Options', function(assert) {
  let changedAttrs, changedInvokeCount = 0;
  registerComponent(this, {
    didReceiveAttrs: diffAttrs({
      keys: ['email', 'isAdmin'],
      changed(changedAttrsArg) {
        changedAttrs = changedAttrsArg;
        changedInvokeCount++;
      }
    })
  });

  this.set('name', 'Tomster');
  this.set('email', 'ember@hamster.org');
  this.set('isAdmin', false);

  this.render(hbs`{{x-changer email=email isAdmin=isAdmin name=name}}`);

  assert.equal(changedInvokeCount, 1, 'There is an invocation on init.');
  assert.equal(changedAttrs.email[0], undefined);
  assert.equal(changedAttrs.email[1], 'ember@hamster.org');
  assert.equal(changedAttrs.isAdmin[0], undefined);
  assert.equal(changedAttrs.isAdmin[1], false);

  this.set('email', 'emberjs@hamster.org');
  assert.equal(changedInvokeCount, 2, 'There is an invocation on update.');
  assert.equal(changedAttrs.email[0], 'ember@hamster.org');
  assert.equal(changedAttrs.email[1], 'emberjs@hamster.org');
  assert.notOk(changedAttrs.isAdmin);

  this.set('name', 'TheTomster');
  assert.equal(changedInvokeCount, 2, 'There was no invocation for update of non-observer attr.');
});

test('Options - Compare', function(assert) {
  let changedInvokeCount = 0;
  registerComponent(this, {
    didReceiveAttrs: diffAttrs({
      keys: ['user'],
      isEqual(a, b) {
        return (a && b) ? a.id === b.id : a === b;
      },
      changed() {
        changedInvokeCount++;
      }
    })
  });

  this.set('user', { name: 'Tomster', id: '123' });

  this.render(hbs`{{x-changer user=user}}`);

  assert.equal(changedInvokeCount, 1, 'There is an invocation on init.');

  this.set('user', { name: 'TheTomster', id: '123' });
  assert.equal(changedInvokeCount, 1, 'No change invocation because user entities are equal');

  this.set('user', { name: 'Zoey', id: '456' });
  assert.equal(changedInvokeCount, 2, 'Invocation because the user id was changed');
});

// Test options
//   - Fire on no change
