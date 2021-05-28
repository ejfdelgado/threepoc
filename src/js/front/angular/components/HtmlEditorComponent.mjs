import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";
import { ModuloActividad } from "../../common/ModuloActividad.mjs";
import { Utilidades } from "../../../common/Utilidades.mjs";

export class HtmlEditorComponentClass {
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
    const partesId = /(\d+)\/index\.html/.exec(response.key);
    const pgid = partesId[1];
    const pubUrl = location.href.replace(
      location.pathname,
      `${location.pathname}pg${pgid}/`
    );
    response.pubUrl = pubUrl;
    console.log(JSON.stringify(response, null, 4));
    actividad.resolve();
  }
}

let RECOMPUTED_PATH = Utilidades.recomputeUrl(location);

export const HtmlEditorComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: `${RECOMPUTED_PATH.pathname}html/index.html`,
  controller: HtmlEditorComponentClass,
};
