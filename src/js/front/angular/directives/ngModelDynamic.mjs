export const ngModelDynamic = [
  "$compile",
  function ($compile) {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        element.removeAttr("ng-model-dynamic");
        element.attr("ng-model", attrs.ngModelDynamic);
        $compile(element)(scope);
      },
    };
  },
];
