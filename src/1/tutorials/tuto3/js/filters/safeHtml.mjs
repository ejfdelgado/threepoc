export const safeHTML = [
  "$sce",
  function ($sce) {
    return function (val) {
      return $sce.trustAsHtml(val);
    };
  },
];
