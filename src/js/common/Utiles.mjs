export class Utiles {
  static list2Text(list) {
    if (list instanceof Array) {
      return list.join(" ");
    } else {
      return "";
    }
  }
  static text2List(text) {
    let list = text.split(/\s+/);
    // Se quitan duplicados y vacíos
    list = list.filter(function (item, pos, self) {
      return item.trim().length > 0 && self.indexOf(item) == pos;
    });
    return list;
  }
  /**
   * Rotarna el path de modo: "https://paistv.appspot.com/1/scan3d?algo=5"
   */
  static getReferer() {
    const pathNameFromBase = document.baseURI.replace(location.origin, "");
    const pathNameFromLocation = location.pathname;
    if (pathNameFromLocation.length > pathNameFromBase.length) {
      return (
        location.origin + pathNameFromLocation + location.search + location.hash
      );
    }
    return location.origin + pathNameFromBase + location.search + location.hash;
  }

  static htmlEntities(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  static async loadJson(url) {
    return new Promise((resolve, reject) => {
      $.getJSON(url, function () {})
        .done(function (data) {
          resolve(data);
        })
        .fail(function () {
          reject(new Error(`Error leyendo ${url}`));
        });
    });
  }

  static getCurrentTimeNumber(ahora = new Date()) {
    //AAAAMMDD.HHmmss
    return (
      ahora.getFullYear() * 10000 +
      (ahora.getMonth() + 1) * 100 +
      ahora.getDay() +
      ahora.getHours() / 100 +
      ahora.getMinutes() / 10000 +
      ahora.getSeconds() / 1000000 +
      ahora.getMilliseconds() / 1000000000
    );
  }

  static promiseState(p) {
    const t = {};
    return Promise.race([p, t]).then(
      (v) => (v === t ? "pending" : "resolved"),
      () => "rejected"
    );
  }

  static extend(a, b) {
    Object.assign(a, b);
  }
}
