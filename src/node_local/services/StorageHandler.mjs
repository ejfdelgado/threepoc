import storagePackage from "@google-cloud/storage";
const { Storage } = storagePackage;
const storageInstance = new Storage();

const bucket = storageInstance.bucket("proyeccion-colombia1.appspot.com");

/**
 * https://googleapis.dev/nodejs/storage/latest/File.html#download
 */

export class StorageHandler {
  /**
   * Lee un archivo de texto plano y responde con su contenido y metadata
   * @param filePath
   */
  static async get(filePath) {
    return new Promise((resolve, reject) => {
      const file = bucket.file(filePath);
      file.exists().then(function (data) {
        const exists = data[0];
        if (exists) {
          var archivo = file.createReadStream();
          var buf = "";
          archivo.on("data", function (d) {
            buf += d;
          });

          file.getMetadata().then(function (data) {
            const metadata = data[0];
            archivo
              .on("end", function () {
                resolve({
                  metadata: metadata,
                  plainText: buf,
                });
              })
              .on("error", function (err) {
                reject(err);
              });
          });
        } else {
          resolve(null);
        }
      });
    });
  }
}
