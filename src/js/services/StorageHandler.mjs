import storagePackage from "@google-cloud/storage";
import express from "express";
import bodyParser from "body-parser";
import Multer from "multer";
import { Constants } from "../common/Constants.mjs";
import { Utilidades } from "../common/Utilidades.mjs";

const { Storage } = storagePackage;
const storageInstance = new Storage();

const bucket = storageInstance.bucket(Constants.DEFAULT_BUCKET);

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/**
 * https://googleapis.dev/nodejs/storage/latest/File.html#download
 */
export class StorageHandler {
  /**
   * Lee el archivo como texto y asume que existe
   * @param filePath
   * @encoding ascii, utf8
   */
  static async readString(filePath, encoding = "utf8") {
    const respuesta = await StorageHandler.readBinary(filePath);
    if (respuesta != null) {
      return respuesta.toString(encoding);
    }
    return null;
  }

  static async checkIfRedirect(filePath) {
    let localPath = filePath.pathname;
    const parte1 = localPath.match(/([^/]+)$/);
    if (parte1 != null && parte1[1].indexOf(".") < 0) {
      localPath = localPath.replace(/^[/]/, "");
      const file = bucket.file(localPath + "/index.html");
      const existe = await file.exists();
      if (existe) {
        return {
          data: null,
          metadata: {},
          redirect: "/" + localPath + "/",
        };
      }
    }
    return null;
  }

  /**
   * Retorna el Buffer!
   * @param filePath
   */
  static async readBinary(filePath) {
    filePath = filePath.replace(/^[/]/, "");
    const file = bucket.file(filePath);
    const contents = (await file.download())[0];
    return contents;
  }

  /**
   * Lee un archivo de texto plano y responde con su contenido y metadata
   * @param filePath
   */
  static read(filePathOriginal, type = "buffer", encoding = "utf8") {
    const filePath = filePathOriginal.replace(/^[/]/, "");
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
          metadata.filename = /[^/]+$/.exec(filePath)[0];
          metadata.fullPath = filePathOriginal;
          const content = respuesta[1];
          resolve({
            metadata: metadata,
            data: content,
          });
        },
        function (err) {
          metadataPromise
            .then(() => {
              reject(err);
            })
            .catch((error) => {
              if (error.code == 404) {
                resolve(null);
              } else {
                reject(err);
              }
            });
        }
      );
    });
  }

  static makeResponse(req, res, key, readPromise) {
    const downloadFlag = req.query ? req.query.download : false;
    readPromise.then(function (rta) {
      if (rta != null) {
        if (rta.redirect) {
          res.redirect(rta.redirect);
        } else {
          res.writeHead(200, {
            "Content-Type": rta.metadata.contentType,
            "Content-disposition":
              downloadFlag != undefined
                ? "attachment;filename=" + rta.metadata.filename
                : "inline",
            "Content-Length": rta.data.length,
          });
          res.end(rta.data);
        }
      } else {
        res.status(202).end();
      }
    });
  }

  static escribir(req, res, next) {
    let key = req.query.key;
    if (!req.file || !key) {
      throw new ParametrosIncompletosException();
    }

    key = Utilidades.trimSlashes(key);

    const blob = bucket.file(key);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      next(err);
    });

    const origin = Utilidades.leerHeader(req, ["Origin"]);

    blobStream.on("finish", async () => {
      const ans = {
        key: key,
        local: `${origin}/storage/read?name=${blob.name}`,
      };
      if (key.match(/^public\/usr\/anonymous/)) {
        await blob.makePublic();
        const epoch = new Date().getTime();
        ans.pub = `${Constants.GOOGLE_PUBLIC}${bucket.name}/${blob.name}?t=${epoch}`;
      }
      res.status(200).json(ans).end();
    });

    blobStream.end(req.file.buffer);
  }
}

/**
 * name=public/hola.txt&type=text&download&encoding=utf8
 */
router.get("/read", function (req, res) {
  const key = req.query.name;
  const readPromise = StorageHandler.read(
    key,
    req.query.type,
    req.query.encoding
  );
  StorageHandler.makeResponse(req, res, key, readPromise);
});

router.post("/", multer.single("file-0"), function (req, res, next) {
  StorageHandler.escribir(req, res, next);
});

export default router;
