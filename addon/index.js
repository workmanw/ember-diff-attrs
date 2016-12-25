import Ember from 'ember';

function isEqual(a, b) {
  return a === b;
}

export default function(keys, changed) {
  let oldValueMap = {},
      isEqualFunc = isEqual;

  if (typeof keys === 'object' && !Ember.isArray(keys)) {
    let options = keys;
    keys = options.keys;

    if (options.isEqual) {
      isEqualFunc = options.isEqual;
    }
    if (options.changed) {
      changed = options.changed;
    }
  }

  return function() {
    this._super(...arguments);

    let changedAttrs = {};

    keys.forEach(key => {
      let value = this.get(key);
      if (!isEqualFunc(oldValueMap[key], value)) {
        changedAttrs[key] = [oldValueMap[key], value];
        oldValueMap[key] = value;
      }
    });

    if (Object.keys(changedAttrs).length > 0) {
      changed.apply(this, [changedAttrs, ...arguments]);
    }
  };
}
