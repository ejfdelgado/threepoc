import { ModuloArchivos } from "../../../../../js/common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../../../../js/front/common/ModuloActividad.mjs";

export class TestComponentClass {
  constructor($scope) {
    this.$scope = $scope;
  }
  $onInit() {
    this.images = {
      image1: {
        src: '/z/img/spacex.jpg'
      }
    };
  }
  $onChanges(changesObj) {
    // Replaces the $watch()
  }
  $onPostLink() {
    // When the component DOM has been compiled attach you eventHandler.
  }
  $postLink() {
    //
  }
  async save() {
    const markup = document.documentElement.innerHTML;
    const actividad = ModuloActividad.on();
    const response = await ModuloArchivos.uploadFile({
      own: false,
      path: "index.html",
      data: markup
    });
    actividad.resolve();
    console.log(response);
  }
}

export const TestComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: "/1/tutorials/tuto3/js/components/TestComponent.html",
  controller: TestComponentClass,
};
