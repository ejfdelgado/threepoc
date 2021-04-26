import express from "express";
import url from "url";
import fs from "fs";
import path from "path";
import { StorageHandler } from "./StorageHandler.mjs";
import { Constants } from "../common/Constants.mjs";
import { guessMimeType } from "../common/MimeTypeMap.mjs";
import { MainHandlerReplace } from "./MainHandlerReplace.mjs";
import { Utilidades } from "../common/Utilidades.mjs";

const router = express.Router();

const HOMOLOGATION_FILES = {
  "/favicon.ico": "/z/img/favicon.ico",
};

export class MainHandler {
  static ROOT_FOLDER = path.resolve() + "/src";
  static decodeUrl(localPath) {
    //Leo los parámetros
    const ans = {
      params: {},
      pathname: localPath.pathname,
      protocol: localPath.protocol,
      hostname: localPath.hostname,
      query:
        localPath.query != null && localPath.query.length > 0
          ? "?" + localPath.query
          : "",
    };
    if (Constants.ROOT_FOLDER.trim().length > 0) {
      const partesSiRaiz = /^\/([^/]*)$/.exec(ans.pathname);
      if (partesSiRaiz != null) {
        if (["/", "", "/index.html"].indexOf(ans.pathname) >= 0) {
          ans.pathname = Constants.ROOT_FOLDER + "/" + partesSiRaiz[1];
        }
      }
    }
    const partesName = /(.*)[/]([^/]*)$/.exec(ans.pathname);
    const partesName1 = partesName[1];
    const partesName2 = partesName[2];
    const files = [];
    if (partesName1.length == 0 && partesName2.length == 0) {
      files.push("/index.html");
    } else if (partesName2.length == 0) {
      files.push(partesName1 + "/index.html");
    } else {
      files.push(partesName1 + "/" + partesName2);
      if (partesName2.indexOf(".") < 0) {
        files.push(partesName1 + "/" + partesName2 + "/index.html");
      }
    }
    const HOMOLOGACIONES = Object.keys(HOMOLOGATION_FILES);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (HOMOLOGACIONES.indexOf(file) >= 0) {
        files[i] = HOMOLOGATION_FILES[file];
      }
    }
    ans.params = Utilidades.getQueryParams(localPath.query);
    files.push("/z/html/404.html");
    ans.files = files;
    return ans;
  }

  /**
   * Retorna null si no existe el archivo
   * Lanza error si algo falla
   * Retorna un buffer
   * @param filename
   */
  static async resolveLocalFileSingle(filename, encoding) {
    return new Promise((resolve, reject) => {
      const somePath = path.join(MainHandler.ROOT_FOLDER, filename);

      fs.access(somePath, (err) => {
        if (err) {
          resolve(null);
        } else {
          if (!fs.lstatSync(somePath).isFile()) {
            console.log(`${somePath} no es un archivo`);
            resolve(null);
            return;
          }
          if (typeof encoding == "string") {
            fs.readFile(somePath, encoding, function (err, data) {
              if (err) {
                reject(err);
                return;
              }
              resolve(data);
            });
          } else {
            fs.readFile(somePath, function (err, data) {
              if (err) {
                reject(err);
                return;
              }
              resolve(data);
            });
          }
        }
      });
    });
  }

  /**
   * Verifica si debe redirigir una ruta sin slash al final
   * @param filePath
   */
  static async checkIfRedirect(filePath) {
    const localPath = filePath.pathname;
    const parte1 = localPath.match(/([^/]+)$/);
    if (parte1 != null && parte1[1].indexOf(".") < 0) {
      const somePath = path.join(
        MainHandler.ROOT_FOLDER,
        localPath + "/index.html"
      );
      if (fs.existsSync(somePath)) {
        return {
          data: null,
          metadata: {},
          redirect: localPath + "/" + filePath.query,
        };
      }
    }
    return null;
  }

  static async resolveLocalFile(localPath, encoding = "utf8") {
    for (let i = 0; i < localPath.files.length; i++) {
      const filename = localPath.files[i];
      const contentType = guessMimeType(filename);
      let contenido;
      if (["text/html"].indexOf(contentType) >= 0) {
        contenido = await MainHandler.resolveLocalFileSingle(
          filename,
          encoding
        );
      } else {
        contenido = await MainHandler.resolveLocalFileSingle(filename);
      }
      if (contenido != null) {
        return {
          data: contenido,
          metadata: {
            contentType: contentType,
            filename: /[^/]*$/.exec(filename)[0],
            fullPath: filename,
          },
        };
      }
    }
  }

  static async resolveBucketFile(
    localPath,
    type = "buffer",
    encoding = "utf8"
  ) {
    for (let i = 0; i < localPath.files.length; i++) {
      const filename = localPath.files[i];
      const rta = await StorageHandler.read(
        "public" + filename,
        type,
        encoding
      );
      if (rta != null) {
        return rta;
      }
    }
    return null;
  }

  static async resolveFile(localPath, encoding = "utf8") {
    let returnedFile = null;
    returnedFile = await MainHandler.checkIfRedirect(localPath);
    if (returnedFile != null) {
      return returnedFile;
    }
    returnedFile = await MainHandler.resolveLocalFile(localPath, encoding);
    if (returnedFile == null) {
      returnedFile = await StorageHandler.checkIfRedirect(localPath);
      if (returnedFile != null) {
        return returnedFile;
      }
      returnedFile = await MainHandler.resolveBucketFile(localPath);
    }
    return returnedFile;
  }

  static handle(req, res, next) {
    const originalUrl = req.getUrl();
    const theUrl = url.parse(originalUrl);
    const localPath = MainHandler.decodeUrl(theUrl);
    localPath.originalUrl = originalUrl;
    const encoding = req.query.encoding;
    let firstPromise = MainHandler.resolveFile(localPath, encoding);
    firstPromise.catch((err) => {
      next(err);
    });
    firstPromise = firstPromise.then((rta) =>
      MainHandlerReplace.replaceTokens(rta, originalUrl)
    );
    StorageHandler.makeResponse(req, res, localPath, firstPromise, next);
  }
}

router.use(function (req, res, next) {
  req.getUrl = function () {
    return req.protocol + "://" + req.get("host") + req.originalUrl;
  };
  return next();
});

router.get("/*", MainHandler.handle);

export default router;
