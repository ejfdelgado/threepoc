export function ngifSearch() {
  const registry = {};
  const listeners = {};
  this.registerListener = function (funcion, key) {
    if (registry[key] !== undefined) {
      try {
        funcion(registry[key]);
      } catch (e) {
        console.error(e);
      }
    } else {
      let ref = listeners[key];
      if (ref === undefined) {
        listeners[key] = [];
      }
      ref = listeners[key];
      if (ref.indexOf(funcion) < 0) {
        ref.push(funcion);
      }
    }
  };
  this.register = function (key, value) {
    registry[key] = value;
    let ref = listeners[key];
    if (ref !== undefined) {
      for (let i = 0; i < ref.length; i++) {
        try {
          ref[i](value);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };
  this.getIfsValues = function (url) {
    return registry[url];
  };
}
