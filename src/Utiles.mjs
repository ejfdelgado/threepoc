
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
}