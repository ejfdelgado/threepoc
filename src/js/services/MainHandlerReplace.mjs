import { Constants } from "../common/Constants.mjs";
import { Utiles } from "../common/Utiles.mjs";
import { PageHandler } from "./PageHandler.mjs";

export class MainHandlerReplace {
  static replaceComments(rta, type) {
    let isOpen = true;
    rta.data = rta.data.replace(
      new RegExp(`(<\\!--)(\\s*${type}\\s*)(-->)`, "g"),
      function (todo, abre, tipo, cierra) {
        if (isOpen) {
          isOpen = !isOpen;
          return abre;
        } else {
          isOpen = !isOpen;
          return cierra;
        }
      }
    );
  }
  static replaceMasterSlave(rta, isSlave) {
    if (isSlave) {
      MainHandlerReplace.replaceComments(rta, "master");
    } else {
      MainHandlerReplace.replaceComments(rta, "slave");
    }
  }
  static replaceMainScript(rta, isSlave, isDebug) {
    let type = 'type="text/javascript"';
    let suffix = ".min.js";
    let prefix = "index";
    const partesPubHtml = /^public\/usr\/anonymous\/[\d]+\/.+\/pg\/[\d]+\/index.html$/i.exec(
      rta.metadata.fullPath
    );
    const isPubHtml = partesPubHtml != null;
    if (isDebug) {
      type = 'type="module"';
      suffix = ".mjs";
    }
    if (isSlave) {
      prefix = "index-slave";
    }
    if (isPubHtml) {
      prefix = "index-public";
    }
    const PATRON = /<script\s+(.*)src=".\/js\/(index\.(min\.js|mjs))"\s*><\/script>/i;
    let nuevo = `<script ${type} src="./js/${prefix}${suffix}"></script>`;
    const PATRON_LIBS = /<script\s+(.*)src="\/node_modules\/([^"]+)"\s*>\s*<\/script>/gi;
    rta.data = rta.data.replace(PATRON_LIBS, function (a) {
      if (!isDebug) {
        return "";
      }
      return a;
    });
    if (!isDebug) {
      nuevo = `<script src="./js/dependencies.min.js"></script>\n        ${nuevo}`;
    }
    rta.data = rta.data.replace(PATRON, nuevo);
  }
  static async replaceTokens(readPromise, originalUrl, path) {
    const partesIdPage = /[?].*(pg=)([\d]+)/.exec(originalUrl);
    const partesSlave = /[?].*(sl=si)/.exec(originalUrl);
    const partesDubug = /[?].*debug=(\d+|si)/.exec(originalUrl);
    const isSlave = partesSlave !== null;
    const isDebug = partesDubug !== null;

    const metadata = {
      tit: "",
      desc: "",
      q: "",
      img: "",
      kw: "",
    };
    let idPagina = null;
    if (partesIdPage != null) {
      idPagina = parseInt(partesIdPage[2]);
      const pagina = await PageHandler.getPageById(idPagina);
      if (pagina != null) {
        metadata.tit = pagina.tit;
        metadata.desc = pagina.desc;
        metadata.img = pagina.img;
        metadata.kw = Utiles.list2Text(pagina.kw);
      }
    }

    const REMPLAZOS = [
      {
        old: /<base[^>]*><\/base>/,
        new: `<base href="${path}"></base>`,
      },
      {
        old: /<base[^>]*><\/base>/,
        new: `<base href="${Constants.ROOT_FOLDER}/"></base>`,
        fullPath: [`${Constants.ROOT_FOLDER}/index.html`],
      },
      {
        old: /name="og:title"[\s]+content="[^"]*"/,
        new: `name="og:title" content="${Utiles.htmlEntities(metadata.tit)}"`,
        empty: typeof metadata.tit != "string" || metadata.tit.length == 0,
      },
      {
        old: /name="og:description"[\s]+content="[^"]*"/,
        new: `name="og:description" content="${Utiles.htmlEntities(
          metadata.desc
        )}"`,
        empty: typeof metadata.desc != "string" || metadata.desc.length == 0,
      },
      {
        old: /name="og:image"[\s]+content="[^"]*"/,
        new: `name="og:image" content="${metadata.img}"`,
        empty: typeof metadata.img != "string" || metadata.img.length == 0,
      },
      {
        old: /name="og:site_name"[\s]+content="[^"]*"/,
        new: `name="og:site_name" content="${Utiles.htmlEntities(
          Constants.SITE_NAME
        )}"`,
      },
      {
        old: /name="og:url"[\s]+content="[^"]*"/,
        new: `name="og:url" content="${originalUrl}"`,
      },
      {
        old: /name="keywords"[\s]+content="[^"]*"/,
        new: `name="keywords" content="${metadata.kw}"`,
        empty: typeof metadata.kw != "string" || metadata.kw.length == 0,
      },
      {
        old: /<title>.*?<\/title>/,
        new: `<title>${Utiles.htmlEntities(metadata.tit)}<\/title>`,
        empty: typeof metadata.tit != "string" || metadata.tit.length == 0,
      },
    ];
    const rta = await readPromise;
    if (
      rta != null &&
      typeof rta.data == "string" &&
      rta.metadata.filename == "index.html"
    ) {
      for (let i = 0; i < REMPLAZOS.length; i++) {
        const remplazo = REMPLAZOS[i];
        if (
          !remplazo.empty &&
          (!remplazo.fullPath ||
            remplazo.fullPath.indexOf(rta.metadata.fullPath) >= 0)
        ) {
          rta.data = rta.data.replace(remplazo.old, remplazo.new);
        }
      }
      MainHandlerReplace.replaceMainScript(rta, isSlave, isDebug);
    }
    return rta;
  }
}
