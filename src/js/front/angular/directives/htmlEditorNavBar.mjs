import { MiSeguridad } from "../../firebase/MiSeguridad.mjs";

export const htmlEditorNavBar = [
  "$parse",
  function ($parse) {
    return {
      restrict: "A",
      scope: {},
      templateUrl: "/js/front/angular/directives/htmlEditorNavBar.html",
      link: function (scope, element, attrs, ngModel) {
        const botonOpenSidebar = $("#paistv-editor-sidebar-collapse");
        const sideBar = $("#sidebar");
        const botonCloseSidebar = sideBar.find(".close-sidebar");

        const funcionToggle = function () {
          if (botonOpenSidebar.hasClass("invisible")) {
            botonOpenSidebar.removeClass("invisible");
            sideBar.addClass("active");
          } else {
            botonOpenSidebar.addClass("invisible");
            sideBar.removeClass("active");
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
          if (ans) {
            scope.user.displayName = ans.usr.displayName;
            scope.user.photoURL = ans.usr.photoURL;
          }
        });
      },
    };
  },
];
