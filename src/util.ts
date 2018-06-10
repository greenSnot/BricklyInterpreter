export const deep_clone = (a) => {
  if (typeof a !== 'object') {
    return a;
  }
  if (a instanceof Array) {
    return a.map(i => deep_clone(a));
  } else {
    return Object.keys(a).reduce(
      (m, i) => {
        m[i] = deep_clone(a[i]);
        return m;
      },
      {},
    );
  }
};