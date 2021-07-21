export const decodeBase64 = [
  function () {
    return function (val) {
      if (typeof val == 'string') {
        return atob(val);
      }
      return val;
    };
  },
];
