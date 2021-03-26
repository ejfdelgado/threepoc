import datastorePackage from "@google-cloud/datastore";
import express from "express";
import bodyParser from "body-parser";

const { Datastore } = datastorePackage;

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/**
 * https://googleapis.dev/nodejs/datastore/latest/Datastore.html#get
 */

const datastore = new Datastore();

export class ShortUrlHandler {
  static KIND = "ShortUrlM";

  static BASE_CONVERSION = 36;

  static digitToChar(digit) {
    if (digit < 10) {
      return "" + digit;
    }
    return String.fromCharCode("a".charCodeAt(0) + digit - 10);
  }

  static strBase(number, base) {
    if (number < 0) {
      return "-" + ShortUrlHandler.strBase(-1 * number, base);
    }

    var d = Math.floor(number / base);
    var m = number % base;
    if (d > 0) {
      return ShortUrlHandler.strBase(d, base) + ShortUrlHandler.digitToChar(m);
    }
    return ShortUrlHandler.digitToChar(m);
  }

  static async leer(req, res) {
    const ident = req.params[0];
    const miId = ShortUrlHandler.strBase(
      ident,
      ShortUrlHandler.BASE_CONVERSION
    );
    const key = datastore.key([ShortUrlHandler.KIND, miId]);
    datastore.get(key, (err, modelo) => {
      let urlredireccion = "/";
      if (modelo != undefined) {
        urlredireccion = modelo["theurl"];
      }
      res.redirect(urlredireccion);
    });
  }
  static async escribir(req, res) {
    const theurl = req.body.theurl;
    const query = datastore
      .createQuery(ShortUrlHandler.KIND)
      .filter("theurl", "=", theurl);
    const datos = (await query.run())[0];

    const ans = {};
    ans["error"] = 0;
    ans["theurl"] = theurl;

    if (datos.length > 0) {
      //Ya existe y no lo debo crear
      const key = datos[0][datastore.KEY];
      ans["base"] = key.id;
      ans["id"] = ShortUrlHandler.strBase(
        key.id,
        ShortUrlHandler.BASE_CONVERSION
      );
    } else {
      //Se debe crear
      const key = datastore.key([ShortUrlHandler.KIND]);
      const entity = {
        key: key,
        data: {
          theurl: theurl,
        },
      };
      await datastore.save(entity);
      ans["id"] = ShortUrlHandler.strBase(entity.key.id, ShortUrlHandler.BASE_CONVERSION);
    }

    res.status(200).json(ans).end();
  }
}

router.get("/*", ShortUrlHandler.leer);
router.post("/*", ShortUrlHandler.escribir);

export default router;
