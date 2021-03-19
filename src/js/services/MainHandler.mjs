import express from "express";
import url from "url";
import fs from "fs";
import path from "path";
import { StorageHandler } from "./StorageHandler.mjs";
import { Constants } from "../common/Constants.mjs";

const router = express.Router();

const EXTENSION_MAP = {
  abs: "audio/x-mpeg",
  ai: "application/postscript",
  aif: "audio/x-aiff",
  aifc: "audio/x-aiff",
  aiff: "audio/x-aiff",
  aim: "application/x-aim",
  art: "image/x-jg",
  asf: "video/x-ms-asf",
  asx: "video/x-ms-asf",
  au: "audio/basic",
  avi: "video/x-msvideo",
  avx: "video/x-rad-screenplay",
  bcpio: "application/x-bcpio",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  body: "text/html",
  cdf: "application/x-cdf",
  cer: "application/x-x509-ca-cert",
  class: "application/java",
  cpio: "application/x-cpio",
  csh: "application/x-csh",
  css: "text/css",
  dib: "image/bmp",
  doc: "application/msword",
  dtd: "text/plain",
  dv: "video/x-dv",
  dvi: "application/x-dvi",
  eps: "application/postscript",
  etx: "text/x-setext",
  exe: "application/octet-stream",
  gif: "image/gif",
  gtar: "application/x-gtar",
  gz: "application/x-gzip",
  hdf: "application/x-hdf",
  hqx: "application/mac-binhex40",
  htc: "text/x-component",
  htm: "text/html",
  html: "text/html",
  ief: "image/ief",
  jad: "text/vnd.sun.j2me.app-descriptor",
  jar: "application/octet-stream",
  java: "text/plain",
  jnlp: "application/x-java-jnlp-file",
  jpe: "image/jpeg",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  kar: "audio/x-midi",
  latex: "application/x-latex",
  m3u: "audio/x-mpegurl",
  mac: "image/x-macpaint",
  man: "application/x-troff-man",
  me: "application/x-troff-me",
  mid: "audio/x-midi",
  midi: "audio/x-midi",
  mif: "application/x-mif",
  mjs: "text/javascript",
  mov: "video/quicktime",
  movie: "video/x-sgi-movie",
  mp1: "audio/x-mpeg",
  mp2: "audio/x-mpeg",
  mp3: "audio/x-mpeg",
  mpa: "audio/x-mpeg",
  mpe: "video/mpeg",
  mpeg: "video/mpeg",
  mpega: "audio/x-mpeg",
  mpg: "video/mpeg",
  mpv2: "video/mpeg2",
  ms: "application/x-wais-source",
  nc: "application/x-netcdf",
  oda: "application/oda",
  pbm: "image/x-portable-bitmap",
  pct: "image/pict",
  pdf: "application/pdf",
  pgm: "image/x-portable-graymap",
  pic: "image/pict",
  pict: "image/pict",
  pls: "audio/x-scpls",
  png: "image/png",
  pnm: "image/x-portable-anymap",
  pnt: "image/x-macpaint",
  ppm: "image/x-portable-pixmap",
  ps: "application/postscript",
  psd: "image/x-photoshop",
  qt: "video/quicktime",
  qti: "image/x-quicktime",
  qtif: "image/x-quicktime",
  ras: "image/x-cmu-raster",
  rgb: "image/x-rgb",
  rm: "application/vnd.rn-realmedia",
  roff: "application/x-troff",
  rtf: "application/rtf",
  rtx: "text/richtext",
  sh: "application/x-sh",
  shar: "application/x-shar",
  smf: "audio/x-midi",
  snd: "audio/basic",
  src: "application/x-wais-source",
  sv4cpio: "application/x-sv4cpio",
  sv4crc: "application/x-sv4crc",
  swf: "application/x-shockwave-flash",
  t: "application/x-troff",
  tar: "application/x-tar",
  tcl: "application/x-tcl",
  tex: "application/x-tex",
  texi: "application/x-texinfo",
  texinfo: "application/x-texinfo",
  tif: "image/tiff",
  tiff: "image/tiff",
  tr: "application/x-troff",
  tsv: "text/tab-separated-values",
  txt: "text/plain",
  ulw: "audio/basic",
  ustar: "application/x-ustar",
  xbm: "image/x-xbitmap",
  xpm: "image/x-xpixmap",
  xwd: "image/x-xwindowdump",
  wav: "audio/x-wav",
  wbmp: "image/vnd.wap.wbmp",
  wml: "text/vnd.wap.wml",
  wmlc: "application/vnd.wap.wmlc",
  wmls: "text/vnd.wap.wmlscript",
  wmlscriptc: "application/vnd.wap.wmlscriptc",
  wrl: "x-world/x-vrml",
  Z: "application/x-compress",
  z: "application/x-compress",
  zip: "application/zip",
};

const HOMOLOGATION_FILES = {
  "/favicon.ico": "/assets/img/favicon.ico",
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
    };
    if (Constants.ROOT_FOLDER.trim().length > 0) {
      const partesSiRaiz = /^\/([^/]*)$/.exec(ans.pathname);
      if (partesSiRaiz != null) {
        if (["/favicon.ico"].indexOf(ans.pathname) < 0) {
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
    const patron = /([^=&]+)=([^=&]+)/g;
    let match;
    do {
      match = patron.exec(localPath.query);
      if (match != null) {
        const llave = match[1];
        const valor = match[2];
        ans.params[llave] = decodeURI(valor);
      }
    } while (match != null);
    ans.files = files;
    return ans;
  }

  static async resolveLocalFileSingleString(filePath, encoding = "utf8") {
    const respuesta = await MainHandler.resolveLocalFileSingle(filePath);
    if (respuesta != null) {
      return respuesta.toString(encoding);
    }
    return null;
  }

  /**
   * Retorna null si no existe el archivo
   * Lanza error si algo falla
   * Retorna un buffer
   * @param filename
   */
  static async resolveLocalFileSingle(filename) {
    return new Promise((resolve, reject) => {
      const somePath = path.join(MainHandler.ROOT_FOLDER, filename);

      if (!fs.existsSync(somePath)) {
        resolve(null);
      } else {
        if (!fs.lstatSync(somePath).isFile()) {
          console.log(`${somePath} no es un archivo`);
          resolve(null);
          return;
        }
        const readStream = fs.createReadStream(somePath, { highWaterMark: 64 });
        const data = [];

        readStream.on("data", (chunk) => {
          data.push(chunk);
        });

        readStream.on("end", () => {
          const buffer = Buffer.concat(data);
          resolve(buffer);
        });

        readStream.on("error", (err) => {
          reject(err);
        });
      }
    });
  }

  static guessMimeType(path) {
    const partesExt = /[.]([^/.]+)/.exec(path);
    if (partesExt == null) {
      return "application/octet-stream";
    }
    const guessed = EXTENSION_MAP[partesExt[1]];
    if (guessed != undefined) {
      return guessed;
    }
    return "application/octet-stream";
  }

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
          redirect: localPath + "/",
        };
      }
    }
    return null;
  }

  static async resolveLocalFile(localPath, encoding = "utf8") {
    for (let i = 0; i < localPath.files.length; i++) {
      const filename = localPath.files[i];
      const contentType = MainHandler.guessMimeType(filename);
      let contenido;
      if (["text/html"].indexOf(contentType) >= 0) {
        contenido = await MainHandler.resolveLocalFileSingleString(
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

  static async replaceTokens(readPromise) {
    const BASE_TAG = `<base href="${Constants.ROOT_FOLDER}/"></base>`;
    const rta = await readPromise;
    if (
      rta != null &&
      typeof rta.data == "string" &&
      rta.metadata.filename == "index.html"
    ) {
      rta.data = rta.data.replace(/(<head>)/, "<head>" + BASE_TAG);
    }
    return rta;
  }

  static handle(req, res) {
    let theUrl = url.parse(req.getUrl());
    const localPath = MainHandler.decodeUrl(theUrl);
    const readPromise = MainHandler.resolveFile(localPath).then((rta) =>
      MainHandler.replaceTokens(rta)
    );
    StorageHandler.makeResponse(req, res, localPath, readPromise);
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
