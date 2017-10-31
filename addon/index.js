import WeakMap from 'ember-weakmap';
import Ember from 'ember';

function isEqual(key, a, b) {
  return a === b;
}

export default function(keys, hook) {
  let oldValuesMap = new WeakMap();
  let isEqualFunc = isEqual;

  if (typeof keys === 'object') {
    let options = keys;
    keys = options.keys;

    if (options.isEqual) {
      isEqualFunc = options.isEqual;
    }
    if (options.hook) {
      hook = options.hook;
    }
  } else if (arguments.length > 1) {
    keys = [].slice.call(arguments);
    hook = keys.pop();
  } else {
    throw new Error('Invalid `diffAttrs` argument. Expected either one or more strings and a function, or an options hash.');
  }

  return function() {
    let changedAttrs = {};
    let oldValues;
    let isFirstCall = false;

    if (!oldValuesMap.has(this)) {
      isFirstCall = true;
      oldValuesMap.set(this, {});
    }

    oldValues = oldValuesMap.get(this);

    keys.forEach(key => {
      let value = this.get(key);
      if (!isEqualFunc(key, oldValues[key], value)) {
        changedAttrs[key] = [oldValues[key], value];
        oldValues[key] = value;
      }
    });

    hook.apply(this, [(isFirstCall ? null : changedAttrs), ...arguments]);
  };
}

const DidChangeAttrs = Ember.Mixin.create({
  _didChangeAttrsWeakMap: null, //this tracks previous state of any `trackAttrChanges`
  didChangeAttrsConfig: [], //attributes to track

  didReceiveAttrs() {
    this._super(...arguments);

    let weakMap = this.get('_didChangeAttrsWeakMap');

    if (weakMap === null) { //first run
      let config = this.get('didChangeAttrsConfig');
      let trackedAttrs = config.attrs;
      let initialValues = {};

      for (let i=0; i<trackedAttrs.length; i++) {
        let key = trackedAttrs[i];
        initialValues[key] = this.get(key);
      }

      weakMap = new WeakMap();
      weakMap.set(this, initialValues);
      this.set('_didChangeAttrsWeakMap', weakMap);
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);

    let config = this.get('didChangeAttrsConfig');
    let trackedAttrs = config.attrs;
    let oldValues = this.get('_didChangeAttrsWeakMap').get(this);
    let changes = {};

    for (let i=0; i<trackedAttrs.length; i++) {
      let key = trackedAttrs[i];
      let current = this.get(key);
      let previous = oldValues[key];

      if (!isEqual(key, previous, current)) { //TODO: configurable equality fn
        changes[key] = { previous, current };
        oldValues[key] = current;
      }
    }

    if(Object.keys(changes).length > 0) {
      this.didChangeAttrs(changes);
    }
  },
});

export { DidChangeAttrs };
