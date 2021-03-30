import { IdGen } from "./IdGen.mjs";
import { Utilidades } from "./Utilidades.mjs";
import { guessMimeType } from "./MimeTypeMap.mjs";
import { ModuloPagina } from "../front/page/ModuloPagina.mjs";

export class ModuloArchivos {
  static async guardarContenidoEstatico() {
    // Debo tomar la url y guardar el archivo basado en eso
    // /ruta/index.htm -> /ruta/index.html (notar la "l")
    const ruta = location.pathname;
    const markup = document.documentElement.innerHTML;
    console.log(markup);
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
    const fullFile = {};
    // 1. check if path is an existing or a new one
    options.path = Utilidades.trimSlashes(options.path);
    if (!options.path.match(/^\/public\/usr\//)) {
      // 1.1.
      const epoch = await IdGen.ahora();
      const reemplazos = IdGen.getDateParts(epoch);
      reemplazos.random = await IdGen.nuevo(epoch);
      reemplazos.key = options.path;
      reemplazos.key = Utilidades.interpolate(reemplazos.key, reemplazos);

      //1.2. Se debe completar con la ruta completa
      const respuestaPagina = await ModuloPagina.leer();
      const pagina = respuestaPagina.valor;
      reemplazos.path = Utilidades.trimSlashes(pagina.path);
      reemplazos.id = pagina.id;
      reemplazos.usr = pagina.aut;

      if (options.own) {
        fullFile.path = Utilidades.interpolate(
          "/public/usr/${usr}/${path}/pg/${id}/${key}",
          reemplazos
        );
      } else {
        fullFile.path = Utilidades.interpolate(
          "/public/usr/anonymous/${path}/pg/${id}/${key}",
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
      console.log(fullFile.data);
    }

    console.log(JSON.stringify(fullFile));
  }
}
