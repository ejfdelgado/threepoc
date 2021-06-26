import { MiSeguridad } from "../../firebase/MiSeguridad.mjs";

export function htmlEditorNavBar() {
  return {
    restrict: "A",
    templateUrl: "/js/front/angular/directives/htmlEditorNavBar2.html",
    link: function (scope, element, attrs, ngModel) {
      const botonOpenSidebar = $("#paistv-editor-sidebar-collapse");
      const sideBar = $("#sidebar");
      const botonCloseSidebar = sideBar.find(".close-sidebar");

      const funcionToggle = function () {
        sideBar.toggleClass("active");
        if (sideBar.hasClass("active")) {
          botonOpenSidebar.addClass("invisible");
        } else {
          botonOpenSidebar.removeClass("invisible");
        }
        
      };

      botonOpenSidebar.on("click", funcionToggle);
      botonCloseSidebar.on("click", funcionToggle);

      scope.user = {};

      scope.logout = function ($event) {
        $event.stopPropagation();
        MiSeguridad.salir();
      };

      MiSeguridad.buscarUsuario().then(function (ans) {
        scope.user.displayName = ans.usr.displayName;
        scope.user.photoURL = ans.usr.photoURL;
      });
    },
  };
}
