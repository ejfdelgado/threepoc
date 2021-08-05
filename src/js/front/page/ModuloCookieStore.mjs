import { Utilidades } from "../../common/Utilidades.mjs";

export class ModuloCookieStore {
  static LOCATION_WITHOUT_PAGE = Utilidades.recomputeUrl(location);

  static lastAction = null;
  static read() {
    if (ModuloCookieStore.lastAction == null) {
      ModuloCookieStore.lastAction = ModuloCookieStore.localRead();
    }
    return ModuloCookieStore.lastAction;
  }
  static write(objeto) {
    ModuloCookieStore.lastAction = ModuloCookieStore.localWrite(objeto);
    return ModuloCookieStore.lastAction;
  }
  static async localRead() {
    const url = new URL(
      `${ModuloCookieStore.LOCATION_WITHOUT_PAGE.origin}/api/cookie/`
    );
    const rta = await fetch(url, { method: "GET" }).then((res) => res.json());
    rta.modelo.json = JSON.parse(rta.modelo.json);
    return rta;
  }

  static async localWrite(objeto) {
    const url = new URL(
      `${ModuloCookieStore.LOCATION_WITHOUT_PAGE.origin}/api/cookie/`
    );
    const rta = await fetch(url, {
      method: "POST",
      body: JSON.stringify(objeto),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    rta.modelo.json = JSON.parse(rta.modelo.json);

    return rta;
  }
}
