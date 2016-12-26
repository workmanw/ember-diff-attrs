# ember-diff-attrs

This addon was spun out of a discussion on [emberjs/rfcs#191](https://github.com/emberjs/rfcs/pull/191) [Deprecate component lifecycle hook arguments].

ember-diff-attrs provides a dry way to track attribute changes using a component's `didReceiveAttrs` lifecycle hook.

PRs, RFCs and comments are welcome!

## Usage

### Shorthand usage
```
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

```
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

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`
