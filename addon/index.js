import { expandProperties } from '@ember/object/computed';

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

    const expandedKeys = [];
    keys.forEach(key => expandProperties(key, expandedKey => expandedKeys.push(expandedKey)));

    expandedKeys.forEach(key => {
      let value = this.get(key);
      if (!isEqualFunc(key, oldValues[key], value)) {
        changedAttrs[key] = [oldValues[key], value];
        oldValues[key] = value;
      }
    });

    hook.apply(this, [(isFirstCall ? null : changedAttrs), ...arguments]);
  };
}
