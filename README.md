# ember-diff-attrs

This addon was spun out of a discussion on [emberjs/rfcs#191](https://github.com/emberjs/rfcs/pull/191) [Deprecate component lifecycle hook arguments].

ember-diff-attrs provides a dry way to track attribute changes using a component's `didReceiveAttrs` lifecycle hook.

PRs, RFCs and comments are welcome!

## ember-did-change-attrs

@GavinJoyce and I (mostly Gavin) created an alternative version of this addon that offers a slightly cleaner API using a mixin instead of a decorator.

See: [ember-did-change-attrs](https://github.com/workmanw/ember-did-change-attrs)

## Usage

### Shorthand usage
```javascript
import diffAttrs from 'ember-diff-attrs';

export default Ember.Component.extend({
  didReceiveAttrs: diffAttrs('email', 'isAdmin', function(changedAttrs, ...args) {
    this._super(...args);

    if(changedAttrs && changedAttrs.email) {
      let oldEmail = changedAttrs.email[0],
          newEmail = changedAttrs.email[1];
      // Do stuff
    }
  })
});
```

Some quick notes:
* The function hook provided to `diffAttrs` will **always** be called, even when a tracked attr is not changed.
* `changedAttrs` will be `null` on the first call.


### Extended usage

```javascript
import diffAttrs from 'ember-diff-attrs';

export default Ember.Component.extend({
  didReceiveAttrs: diffAttrs({
    keys: ['user', 'isAdmin'],
    isEqual(key, a, b) {
      if (key === 'user') {
        return (a && b) ? a.id === b.id : a === b;
      }
      return a === b;
    },
    hook(changedAttrs, ...args) {
      this._super(...args);

      if(changedAttrs && changedAttrs.user) {
        let oldUser = changedAttrs.user[0],
            newUser = changedAttrs.user[1];
        // Do stuff
      }
    }
  })
});
```


## Design thoughts / rationales.

* `changedAttrs` null on `init` -- It seems likely that some users will want an alternate behavior for `init` vs `update`. There is no loss of functionality by having `changedAttrs` null on `init` and it's easy to explain, _nothing has actually changed yet_.
* `changedAttrs` structure -- I followed the precedence started by ember-data (`model.changedAttributes()`).

## Outstanding Questions

### Changed attrs format

I followed ember-data's precedence for representing old and new values (`model.changedAttributes()`). This format has always felt odd to me. I'm more than happy to discuss changing this.

### didUpdateAttrs

Since this addon is implemented as a macro, it cannot easily utilize a component's `init` call to setup. Because of this, we are unable to determine what has changed the first time `didUpdateAttrs` is called.  

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
