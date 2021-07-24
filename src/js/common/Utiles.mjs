import { Constants } from "./Constants.mjs";
import { Utilidades } from "./Utilidades.mjs";

export class Utiles {
  static LISTA_NEGRA_TOKENS = [
    "de",
    "en",
    "con",
    "para",
    "el",
    "él",
    "la",
    "sin",
    "mas",
    "ella",
    "ellos",
    "es",
    "un",
    "una",
  ];
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
    const LOCATION_WITHOUT_PAGE = Utilidades.recomputeUrl(location);
    const pathNameFromBase = document.baseURI.replace(
      LOCATION_WITHOUT_PAGE.origin,
      ""
    );
    const pathNameFromLocation = LOCATION_WITHOUT_PAGE.pathname;
    if (pathNameFromLocation.length > pathNameFromBase.length) {
      return (
        LOCATION_WITHOUT_PAGE.origin +
        pathNameFromLocation +
        LOCATION_WITHOUT_PAGE.search +
        LOCATION_WITHOUT_PAGE.hash
      );
    }
    return (
      LOCATION_WITHOUT_PAGE.origin +
      pathNameFromBase +
      LOCATION_WITHOUT_PAGE.search +
      LOCATION_WITHOUT_PAGE.hash
    );
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

  static getSubWords(word, min = 2) {
    const ans = [];
    for (let i = min; i <= word.length; i++) {
      const subWord = word.substr(0, i);
      ans.push(subWord);
    }
    return ans;
  }

  static getSearchables(
    phrase,
    min = Constants.SEARCH_PAGE_MIN_TOKEN,
    blacklist = Utiles.LISTA_NEGRA_TOKENS,
    sencillo = false
  ) {
    const ans = [];
    if (!(typeof phrase == "string")) {
      return ans;
    }
    // 0. minúsculas
    phrase = phrase.toLowerCase();
    // 1. Reemplazar tildes y números
    const MAPA = {
      á: "a",
      é: "e",
      í: "i",
      ó: "o",
      ú: "u",
      ü: "u",
    };
    phrase = phrase.replace(/[á-úü]/g, function (a) {
      return MAPA[a];
    });
    phrase = phrase.replace(/[^\w\s]/g, "");

    const partes = phrase.split(/[\s+]/g);
    for (let i = 0; i < partes.length; i++) {
      const word = partes[i];
      if (sencillo) {
        if (ans.indexOf(word) < 0 && blacklist.indexOf(word) < 0) {
          ans.push(word);
        }
      } else {
        const subpartes = Utiles.getSubWords(word, min);
        for (let j = 0; j < subpartes.length; j++) {
          const subword = subpartes[j];
          if (ans.indexOf(subword) < 0 && blacklist.indexOf(subword) < 0) {
            ans.push(subword);
          }
        }
      }
    }
    return ans;
  }

  static fixTinyMceBugWithBootstrapModal() {
    $(document).on("focusin", function (e) {
      if (
        $(e.target).closest("body>.tox.tox-silver-sink.tox-tinymce-aux").length
      ) {
        e.stopImmediatePropagation();
      }
    });
  }

  static ajustarCarusel() {
    $(".carousel-inner").each(function (a, b) {
      const elem = $(b);
      setTimeout(function () {
        const hijos = elem.find(".carousel-item");
        if (hijos.length > 0) {
          if (elem.find(".carousel-item.active").length == 0) {
            $(hijos[0]).addClass("active");
          }
        }
      }, 0);
    });
  };
}
