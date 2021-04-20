export class ModuloHtml {
  static CACHE = {};
  static async getHtml(url, opciones = {}) {
    opciones = Object.assign({
      avoidCache: false
    }, opciones);
    return new Promise(async (resolve, reject) => {
      let val = null;
      if (opciones.avoidCache !== true) {
        val = ModuloHtml.CACHE[url];
        if (typeof val == "string") {
          resolve(val);
          return;
        }
      }
      val = await fetch(url, { method: "GET" }).then((res) => res.text());
      ModuloHtml.CACHE[url] = val;
      resolve(val);
    });
  }
}
