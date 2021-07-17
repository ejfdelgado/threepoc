import { IdGen } from "./IdGen.mjs";
import { Utilidades } from "./Utilidades.mjs";
import { guessMimeType } from "./MimeTypeMap.mjs";
import { ModuloPagina } from "../front/page/ModuloPagina.mjs";
import { Constants } from "./Constants.mjs";
import { ModuloActividad } from "../front/common/ModuloActividad.mjs";
import { ModuloModales } from "../front/common/ModuloModales.mjs";

export class ModuloArchivos {
  static async borrar(key) {
    const actividad = ModuloActividad.on();
    const queryParams = {
      name: key,
    };
    const url = new URL(
      `${ModuloPagina.LOCATION_WITHOUT_PAGE.origin}/storage/borrar`
    );
    url.search = Utilidades.generateQueryParams(queryParams);
    const response = await fetch(url, {
      method: "delete",
    }).then((res) => res.json());
    actividad.resolve();
    if (response.error != 0) {
      throw new Error(response.message);
    }
    return response;
  }
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
        maximoTamanio: Constants.MAX_BYTES_UPLOAD_FILES,
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
          reject(
            new Error(
              "Archivo muy grande! debe ser menor a " +
                atributos.maximoTamanio / 1024 +
                " KB"
            )
          );
        } else {
          resolve(file);
        }
      });
      temp.click();
    });
  }

  /*
  {
    "YYYY":2021,
    "MM":"07",
    "DD":10,
    "HH":14,
    "mm":55,
    "ss":55,
    "zz":330,
    "EPOCH":1625946955330,
    "yyyy":2021,
    "dd":10,
    "random":"00g0clpwhwia",
    "name":"License premium.txt",
    "extension":"txt",
    "path":"1/html/cv",
    "id":"5731346630574080",
    "usr":"google.com/edgar.jose.fernando.delgado@gmail.com"
  }
  */
  static async uploadFile(optionsIn = {}) {
    const options = Object.assign(
      {
        own: true,
        subDomainPrefix: null,
        path: null,
        data: null, // String, Blob, Canvas
      },
      optionsIn
    );
    if (options.data == null) {
      // Lanzar el file picker
      try {
        options.data = await ModuloArchivos.askForFile(options);
      } catch (e) {
        ModuloModales.alert({message: e.message});
        return;
      }
    }

    const actividad = ModuloActividad.on();
    if (options.data.nodeName == "CANVAS") {
      // image/webp image/jpeg image/png
      const mimeType = guessMimeType(options.path);
      const CANVAS_QUALITY_IMAGE = 0.92;
      options.data = await new Promise((resolve) => {
        options.data.toBlob(
          function (blob) {
            resolve(blob);
          },
          mimeType,
          CANVAS_QUALITY_IMAGE
        );
      });
    }

    const fullFile = {};
    // 1. check if path is an existing or a new one
    options.path = Utilidades.trimSlashes(options.path);

    const isNew = Utilidades.getBucketKey(options.path) == null;
    const useSubDomain =
      typeof options.subDomainPrefix == "string" &&
      options.subDomainPrefix.trim().length > 0;
    if (isNew) {
      // 1.1.
      const epoch = await IdGen.ahora();
      const reemplazos = IdGen.getDateParts(epoch);
      reemplazos.random = await IdGen.nuevo(epoch);
      reemplazos.key = options.path;
      if (options.data.name) {
        reemplazos.name = options.data.name;
        reemplazos.extension = "";
        const partesExtension = /\.([^\.]*)$/.exec(reemplazos.name);
        if (partesExtension != null) {
          reemplazos.extension = partesExtension[1];
        }
      }
      reemplazos.key = Utilidades.interpolate(reemplazos.key, reemplazos);

      //1.2. Se debe completar con la ruta completa
      const respuestaPagina = await ModuloPagina.leer();
      const pagina = respuestaPagina.valor;
      reemplazos.path = Utilidades.trimSlashes(pagina.path);
      reemplazos.id = pagina.id;
      reemplazos.usr = pagina.aut;

      // Recordar que reemplazos.key es igual a options.path
      // y que reemplazos.path es igual al path de la página
      if (options.own) {
        fullFile.path = Utilidades.interpolate(
          "public/usr/${usr}/${path}/pg/${id}/${key}",
          reemplazos
        );
      } else {
        if (useSubDomain && /\.html/i.exec(reemplazos.key) != null) {
          // Guarda los htmls en la ruta del subdominio
          fullFile.path = Utilidades.interpolate(
            "public" + options.subDomainPrefix + "/${key}",
            reemplazos
          );
        } else {
          fullFile.path = Utilidades.interpolate(
            "public/usr/anonymous/${path}/pg/${id}/${key}",
            reemplazos
          );
        }
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

    //console.log(JSON.stringify(response));
    actividad.resolve();
    return response;
  }
}
