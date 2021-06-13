export function htmlEditorNavBar() {
  return {
    restrict: "A",
    templateUrl: "/js/front/angular/directives/htmlEditorNavBar2.html",
    link: function (scope, element, attrs, ngModel) {
      $("#paistv-editor-sidebar-collapse").on("click", function () {
        $("#sidebar").toggleClass("active");
      });
    },
  };
}
