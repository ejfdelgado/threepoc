export class Utiles {
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
      (v) => (v === t ? "pending" : "fulfilled"),
      () => "rejected"
    );
  }
}
