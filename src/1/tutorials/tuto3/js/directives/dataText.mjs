export function dataText() {
  return {
    restrict: "A",
    require: "ngModel",
    link: function (scope, element, attrs, ngModel) {
      const predef = $(element).attr("default");
      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function () {
        $(element).attr("contenteditable", "true");
        element.html(ngModel.$viewValue || predef);
      };

      element.bind("blur keyup change", function () {
        scope.$apply(read);
      });
    },
  };
}
