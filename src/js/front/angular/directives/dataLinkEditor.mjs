export function dataLinkEditor() {
  return {
    restrict: "A",
    require: "ngModel",
    link: function (scope, element, attrs, ngModel) {
      element.on("click", function (e) {
        e.preventDefault();
        // Se debe es mostrar un modal donde se pueda editar:
        // - target
        // - el enlace en sí
        alert('hey');
      });
    },
  };
}
