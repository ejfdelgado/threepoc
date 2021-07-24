export function dataText() {
  return {
    restrict: "A",
    require: "ngModel",
    scope: {},
    link: function (scope, element, attrs, ngModel) {
      const predef = $(element).attr("default");
      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function () {
        element.attr("contenteditable", "true");
        element.html(ngModel.$viewValue || predef);
        element.keydown(function (e) {
          if (e.keyCode === 13) {
            document.execCommand("insertHTML", false, "<br/><br/>");
            return false;
          }
        });
      };

      element.bind("blur keyup change", function () {
        scope.$apply(read);
      });

      element[0].addEventListener("paste", function (e) {
        e.preventDefault();
        var text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      });
    },
  };
}
