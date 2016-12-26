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
  let changedAttrs;
  registerComponent(this, {
    didReceiveAttrs: diffAttrs('email', 'isAdmin', function(changedAttrsArg) {
      changedAttrs = changedAttrsArg;
    })
  });

  this.set('name', 'Tomster');
  this.set('email', 'ember@hamster.org');
  this.set('isAdmin', false);

  this.render(hbs`{{x-changer email=email isAdmin=isAdmin name=name}}`);

  assert.notOk(changedAttrs, '`changedAttrs` is null init.');

  this.set('email', 'emberjs@hamster.org');
  assert.equal(changedAttrs.email[0], 'ember@hamster.org');
  assert.equal(changedAttrs.email[1], 'emberjs@hamster.org');
  assert.notOk(changedAttrs.isAdmin);

  this.set('name', 'TheTomster');
  assert.equal(Object.keys(changedAttrs).length, 0, '`changedAttrs` is because `name` is not tracked');
});

test('Calling `_super`', function(assert) {
  let superInvokeCount = 0, changedAttrs;
  let SuperComponent = Ember.Component.extend({
    didReceiveAttrs() {
      superInvokeCount++;
    }
  });
  registerComponent(this, {
    didReceiveAttrs: diffAttrs('email', function(changedAttrsArg, ...args) {
      this._super(...args);
      changedAttrs = changedAttrsArg;
    })
  }, SuperComponent);

  this.set('name', 'Tomster');
  this.set('email', 'ember@hamster.org');

  this.render(hbs`{{x-changer email=email name=name}}`);

  assert.equal(superInvokeCount, 1, 'Super invoked on init.');
  assert.notOk(changedAttrs, '`changedAttrs` is null init.');

  this.set('email', 'emberjs@hamster.org');
  assert.equal(superInvokeCount, 2, 'Super invoked on change.');
  assert.ok(changedAttrs.email, 'Email was changed.');

  this.set('name', 'TheTomster');
  assert.equal(superInvokeCount, 3, 'Super invoked when there is no difference.');
  assert.equal(Object.keys(changedAttrs).length, 0, '`changedAttrs` is because `name` is not tracked');
});

test('Options', function(assert) {
  let changedAttrs;
  registerComponent(this, {
    didReceiveAttrs: diffAttrs({
      keys: ['email', 'isAdmin'],
      hook(changedAttrsArg) {
        changedAttrs = changedAttrsArg;
      }
    })
  });

  this.set('name', 'Tomster');
  this.set('email', 'ember@hamster.org');
  this.set('isAdmin', false);

  this.render(hbs`{{x-changer email=email isAdmin=isAdmin name=name}}`);

  assert.notOk(changedAttrs, '`changedAttrs` is null init.');

  this.set('email', 'emberjs@hamster.org');
  assert.equal(changedAttrs.email[0], 'ember@hamster.org');
  assert.equal(changedAttrs.email[1], 'emberjs@hamster.org');
  assert.notOk(changedAttrs.isAdmin);

  this.set('name', 'TheTomster');
  assert.equal(Object.keys(changedAttrs).length, 0, '`changedAttrs` is because `name` is not tracked');
});

test('Options - Compare', function(assert) {
  let changedAttrs = {};
  registerComponent(this, {
    didReceiveAttrs: diffAttrs({
      keys: ['user', 'isAdmin'],
      isEqual(key, a, b) {
        if (key === 'user') {
          return (a && b) ? a.id === b.id : a === b;
        }
        return a === b;
      },
      hook(changedAttrsArg) {
        changedAttrs = changedAttrsArg;
      }
    })
  });

  this.set('user', { name: 'Tomster', id: '123' });
  this.set('isAdmin', false);

  this.render(hbs`{{x-changer user=user isAdmin=isAdmin}}`);

  assert.notOk(changedAttrs, '`changedAttrs` is null init.');

  this.set('user', { name: 'TheTomster', id: '123' });
  assert.equal(Object.keys(changedAttrs).length, 0, '`user` not included in `changedAttrs` because user entities are equal');

  this.set('user', { name: 'Zoey', id: '456' });
  assert.ok(changedAttrs.user, '`user` included in `changedAttrs` because `user.id` is different.');

  this.set('isAdmin', true);
  assert.ok(changedAttrs.isAdmin, '`isAdmin` fell back to the default comparer');
});
