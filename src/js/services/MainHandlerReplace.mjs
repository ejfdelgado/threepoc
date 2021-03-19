import { Constants } from "../common/Constants.mjs";

export class MainHandlerReplace {
  static async replaceTokens(readPromise, originalUrl) {
    const metadata = {
      tit: "Título",
      desc: "Descripción",
      q: "key words",
      img: "http://dominio.com/image.png",
    };
    const REMPLAZOS = [
      {
        old: /<base[^>]*><\/base>/,
        new: `<base href="${Constants.ROOT_FOLDER}/"></base>`,
        fullPath: [`${Constants.ROOT_FOLDER}/index.html`],
      },
      {
        old: /name="og:title"[\s]+content="[^"]*"/,
        new: `name="og:title" content="${metadata.tit}"`,
      },
      {
        old: /name="og:description"[\s]+content="[^"]*"/,
        new: `name="og:description" content="${metadata.desc}"`,
      },
      {
        old: /name="og:image"[\s]+content="[^"]*"/,
        new: `name="og:image" content="${metadata.img}"`,
      },
      {
        old: /name="og:site_name"[\s]+content="[^"]*"/,
        new: `name="og:site_name" content="${Constants.SITE_NAME}"`,
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
        old: /<title><\/title>/,
        new: `<title>${metadata.tit}<\/title>`,
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
    }
    return rta;
  }
}
