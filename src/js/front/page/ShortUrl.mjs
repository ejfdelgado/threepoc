import { Utilidades } from "../../common/Utilidades.mjs";

export class ShortUrl {
  static LOCATION_WITHOUT_PAGE = Utilidades.recomputeUrl(location);
  static async get(slaveUrl) {
    const url = new URL(`${ShortUrl.LOCATION_WITHOUT_PAGE.origin}/a/`);
    const respuesta = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        theurl: slaveUrl,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());

    return `${ShortUrl.LOCATION_WITHOUT_PAGE.origin}/a/${respuesta.id}`;
  }
}
