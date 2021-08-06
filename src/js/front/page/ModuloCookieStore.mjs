import { Utilidades } from "../../common/Utilidades.mjs";
import { EventEmitter } from "../../common/EventEmitter.mjs";

export class ModuloCookieStore {
  static LOCATION_WITHOUT_PAGE = Utilidades.recomputeUrl(location);

  static lastAction = null;
  static em = new EventEmitter();
  static firstTimeNotified = [];

  static notify() {
    ModuloCookieStore.lastAction.then((data) => {
      ModuloCookieStore.em.emit("data", data);
    });
  }

  static subscribe(callback) {
    ModuloCookieStore.em.on("data", (data) => {
      if (ModuloCookieStore.firstTimeNotified.indexOf(callback) < 0) {
        ModuloCookieStore.firstTimeNotified.push(callback);
      }
      callback(data);
    });
    if (
      ModuloCookieStore.firstTimeNotified.indexOf(callback) < 0 &&
      ModuloCookieStore.lastAction !== null
    ) {
      ModuloCookieStore.lastAction.then((data) => {
        ModuloCookieStore.firstTimeNotified.push(callback);
        callback(data);
      });
    }
  }

  static async read() {
    if (ModuloCookieStore.lastAction == null) {
      ModuloCookieStore.lastAction = ModuloCookieStore.localRead();
      await ModuloCookieStore.lastAction;
      ModuloCookieStore.notify();
    }
    return ModuloCookieStore.lastAction;
  }
  static async write(objeto) {
    ModuloCookieStore.lastAction = ModuloCookieStore.localWrite(objeto);
    await ModuloCookieStore.lastAction;
    ModuloCookieStore.notify();
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
