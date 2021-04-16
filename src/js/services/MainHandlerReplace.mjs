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
  static async replaceTokens(readPromise, originalUrl) {
    const partesIdPage = /[?].*(pg=)([\d]+)/.exec(originalUrl);
    const partesSlave = /[?].*(sl=si)/.exec(originalUrl);
    const isSlave = partesSlave !== null;

    const metadata = {
      tit: "",
      desc: "",
      q: "",
      img: "",
    };
    let idPagina = null;
    if (partesIdPage != null) {
      idPagina = parseInt(partesIdPage[2]);
      const pagina = await PageHandler.getPageById(idPagina);
      if (pagina != null) {
        metadata.tit = pagina.tit;
        metadata.desc = pagina.desc;
        metadata.img = pagina.img;
        metadata.q = pagina.q;
      }
    }

    const REMPLAZOS = [
      {
        old: /<base[^>]*><\/base>/,
        new: `<base href="${Constants.ROOT_FOLDER}/"></base>`,
        fullPath: [`${Constants.ROOT_FOLDER}/index.html`],
      },
      {
        old: /name="og:title"[\s]+content="[^"]*"/,
        new: `name="og:title" content="${Utiles.htmlEntities(metadata.tit)}"`,
      },
      {
        old: /name="og:description"[\s]+content="[^"]*"/,
        new: `name="og:description" content="${Utiles.htmlEntities(
          metadata.desc
        )}"`,
      },
      {
        old: /name="og:image"[\s]+content="[^"]*"/,
        new: `name="og:image" content="${metadata.img}"`,
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
        new: `name="keywords" content="${metadata.q}"`,
      },
      {
        old: /<title>.*?<\/title>/,
        new: `<title>${Utiles.htmlEntities(metadata.tit)}<\/title>`,
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
          !remplazo.fullPath ||
          remplazo.fullPath.indexOf(rta.metadata.fullPath) >= 0
        ) {
          rta.data = rta.data.replace(remplazo.old, remplazo.new);
        }
      }
      MainHandlerReplace.replaceMasterSlave(rta, isSlave);
    }
    return rta;
  }
}
