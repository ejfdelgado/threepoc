
export class Utiles {
    static async loadJson(url: string) {
        return new Promise((resolve, reject) => {
          $.getJSON(url, function () {})
            .done(function (data: any) {
              resolve(data);
            })
            .fail(function () {
              reject(new Error(`Error leyendo ${url}`));
            });
        });
      }
}