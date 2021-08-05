import datastorePackage from "@google-cloud/datastore";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const { Datastore } = datastorePackage;

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());

function getCookieName(req) {
  return "paistv_pub";
}

router.use(function (req, res, next) {
  const cookie_name = getCookieName(req);
  let cookie = req.cookies[cookie_name];
  const ANIO = 1000 * 60 * 60 * 24 * 365;
  if (cookie === undefined) {
    let randomNumber = Math.random().toString();
    cookie = randomNumber.substring(2, randomNumber.length);
    res.cookie(cookie_name, cookie, {
      maxAge: ANIO,
      path: "/",
      httpOnly: true,
    });
  } else {
    res.cookie(cookie_name, cookie, {
      maxAge: ANIO,
      httpOnly: true,
    });
  }
  req.paistv_cookie = cookie;
  next();
});

const datastore = new Datastore();

export class CookieStoreHandler {
  static KIND = "Cookie";

  static async leer(req, res) {
    const ans = {};
    ans.id = req.paistv_cookie;

    const key = datastore.key([CookieStoreHandler.KIND, ans.id]);
    const modelo = await datastore.get(key);
    ans.modelo = modelo[0];
    if (ans.modelo === null || ans.modelo === undefined) {
      ans.modelo = { json: "{}" };
    }
    res.status(200).json(ans).end();
  }
  static async escribir(req, res) {
    const ans = {};
    const peticion = req.body;
    ans.id = req.paistv_cookie;

    const key = datastore.key([CookieStoreHandler.KIND, ans.id]);
    const AHORA = new Date().getTime() / 1000;
    const entity = {
      key: key,
      data: {
        act: AHORA,
        json: JSON.stringify(peticion),
      },
    };
    entidad.excludeFromIndexes = ["json"];
    await datastore.save(entity);
    ans.modelo = entity.data;

    res.status(200).json(ans).end();
  }
}

router.get("/*", CookieStoreHandler.leer);
router.post("/*", CookieStoreHandler.escribir);

export default router;
