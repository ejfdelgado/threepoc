export const theEncodeURIComponent = [
    function () {
      return function (val) {
        return encodeURIComponent(val);
      };
    },
  ];
  