import { ModuloArchivos } from "../../../../../js/common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../../../../js/front/common/ModuloActividad.mjs";

export class TestComponentClass {
  constructor($scope) {
    this.$scope = $scope;
  }
  $onInit() {
    this.content = {
      images: {},
      texts: {},
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
    let markup = document.documentElement.innerHTML;
    markup = markup.replace(/contenteditable=["'][^"']+["']/gi, "");
    markup = markup.replace(/paistv-editor-[^\s]+/gi, "");
    markup = markup.replace(
      /<script\s+src=["']\.\/js\/dependencies\.min\.js["']\s+>\s+<\/script>/i,
      ""
    );

    // Borrar paistv-editor-*
    const actividad = ModuloActividad.on();
    const response = await ModuloArchivos.uploadFile({
      own: false,
      path: "index.html",
      data: markup,
    });
    actividad.resolve();
    console.log(JSON.stringify(response, null, 4));
  }
}

export const TestComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: "/1/tutorials/tuto3/js/components/TestComponent.html",
  controller: TestComponentClass,
};
