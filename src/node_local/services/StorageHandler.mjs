import storagePackage from "@google-cloud/storage";
import express from "express";

const { Storage } = storagePackage;
const storageInstance = new Storage();

const bucket = storageInstance.bucket("proyeccion-colombia1.appspot.com");

var router = express.Router();

/**
 * https://googleapis.dev/nodejs/storage/latest/File.html#download
 */
export class StorageHandler {
  static MIME_TYPE_TEXT = ["application/json", "text/plain", "text/html"];

  static isMimeTypeText(metadata) {
    return StorageHandler.MIME_TYPE_TEXT.indexOf(metadata.contentType) >= 0;
  }

  /**
   * Lee el archivo como texto y asume que existe
   * @param filePath
   * @encoding ascii, utf8
   */
  static async readString(filePath, encoding = "utf8") {
    return (await StorageHandler.readBinary(filePath)).toString(encoding);
  }

  /**
   * Retorna el Buffer!
   * @param filePath
   */
  static async readBinary(filePath) {
    const file = bucket.file(filePath);
    const contents = (await file.download())[0];
    return contents;
  }

  /**
   * Lee un archivo de texto plano y responde con su contenido y metadata
   * @param filePath
   */
  static read(filePath, type="buffer", encoding="utf8") {
    const file = bucket.file(filePath);
    const metadataPromise = file.getMetadata();
    let contentPromise;
    if (type == "text") {
      contentPromise = StorageHandler.readString(filePath, encoding);
    } else {
      contentPromise = StorageHandler.readBinary(filePath);
    }
    return new Promise((resolve, reject) => {
      Promise.all([metadataPromise, contentPromise]).then(
        function (respuesta) {
          const metadata = respuesta[0][0];
          const content = respuesta[1];
          resolve({
            metadata: metadata,
            data: content,
          });
        },
        function (err) {
          console.log(err);
          resolve(null);
        }
      );
    });
  }
}

/**
 * name=public/hola.txt&type=text&download&encoding=utf8
 */
router.get("/read", function (req, res) {
  const key = req.query.name;
  const downloadFlag = req.query.download;
  let readPromise;
  readPromise = StorageHandler.read(key, req.query.type, req.query.encoding);
  readPromise.then(function (rta) {
    if (rta != null) {
      res.writeHead(200, {
        "Content-Type": rta.metadata.contentType,
        "Content-disposition":
          downloadFlag != undefined ? "attachment;filename=" + key : "inline",
        "Content-Length": rta.data.length,
      });
      res.end(rta.data);
    } else {
      res.status(202).end();
    }
  });
});

export default router;
