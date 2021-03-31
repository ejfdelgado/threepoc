import { IdGen } from "./IdGen.mjs";
import { Utilidades } from "./Utilidades.mjs";
import { guessMimeType } from "./MimeTypeMap.mjs";
import { ModuloPagina } from "../front/page/ModuloPagina.mjs";
import { Constants } from "./Constants.mjs";

export class ModuloArchivos {
  static async guardarContenidoEstatico() {
    // Debo tomar la url y guardar el archivo basado en eso
    // /ruta/index.htm -> /ruta/index.html (notar la "l")
    const ruta = location.pathname;
    const markup = document.documentElement.innerHTML;
    console.log(markup);
  }

  static askForFile(atributosIn) {
    const atributos = Object.assign(
      {
        tipos: [],
        maximoTamanio: 1024,
      },
      atributosIn
    );
    var temp = $(
      '<input type="file" class="invisible" accept="' +
        atributos.tipos.join(",") +
        '">'
    );
    return new Promise((resolve, reject) => {
      temp.on("change", function (e) {
        var file = e.target.files[0];
        if (file.size > atributos.maximoTamanio) {
          alert(
            "Archivo muy grande! debe ser menor a " +
              atributos.maximoTamanio / 1024 +
              " KB"
          );
          reject();
        } else {
          resolve(file);
        }
      });
      temp.click();
    });
  }

  static async uploadFile(optionsIn = {}) {
    const options = Object.assign(
      {
        own: true,
        path: null,
        data: null, // Blob or text
      },
      optionsIn
    );
    if (options.data == null) {
      // Lanzar el file picker
      options.data = await ModuloArchivos.askForFile(options);
    }

    const fullFile = {};
    // 1. check if path is an existing or a new one
    options.path = Utilidades.trimSlashes(options.path);

    const isNew = Utilidades.getBucketKey(options.path) == null;
    if (isNew) {
      // 1.1.
      const epoch = await IdGen.ahora();
      const reemplazos = IdGen.getDateParts(epoch);
      reemplazos.random = await IdGen.nuevo(epoch);
      reemplazos.key = options.path;
      if (options.data.name) {
        reemplazos.name = options.data.name;
      }
      reemplazos.key = Utilidades.interpolate(reemplazos.key, reemplazos);

      //1.2. Se debe completar con la ruta completa
      const respuestaPagina = await ModuloPagina.leer();
      const pagina = respuestaPagina.valor;
      reemplazos.path = Utilidades.trimSlashes(pagina.path);
      reemplazos.id = pagina.id;
      reemplazos.usr = pagina.aut;

      if (options.own) {
        fullFile.path = Utilidades.interpolate(
          "public/usr/${usr}/${path}/pg/${id}/${key}",
          reemplazos
        );
      } else {
        fullFile.path = Utilidades.interpolate(
          "public/usr/anonymous/${path}/pg/${id}/${key}",
          reemplazos
        );
      }
    } else {
      fullFile.path = options.path;
    }
    // 2. Se debe deducir el mime type
    fullFile.mimeType = guessMimeType(fullFile.path);
    // 3. Si es texto, se convierte a blob
    if (typeof options.data == "string") {
      const aFileParts = [];
      aFileParts.push(options.data);
      fullFile.data = new Blob(aFileParts, { type: fullFile.mimeType });
    } else {
      fullFile.data = options.data;
    }

    var form = new FormData();
    form.append(
      "file-0",
      fullFile.data,
      fullFile.path.replace(/.*\/([^/]+)$/, "$1")
    );
    const queryParams = {
      key: fullFile.path,
    };
    const response = await fetch(
      "/storage/?" + Utilidades.generateQueryParams(queryParams),
      {
        method: "post",
        body: form,
      }
    ).then((res) => res.json());

    console.log(JSON.stringify(response));
  }
}
