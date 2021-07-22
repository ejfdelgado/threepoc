import express from "express";
import { StorageHandler } from "./StorageHandler.mjs";
import { Usuario } from "./Usuario.mjs";
var router = express.Router();

router.get("/identidad", Usuario.authDecorator, function (req, res) {
  const usuario = req._user;
  if (usuario != null) {
    const ans = usuario.getIdentity();
    res.status(200).json(ans).end();
  } else {
    res.status(204).json(null).end();
  }
});

/**
 * Se encarga de leer el api key de firebase
 */
router.get("/somedata", function (req, res, next) {
  const host = req.header("Host");
  const path = `security/${host}/api-key.json`;
  const promesa = StorageHandler.read(path);
  promesa.then((data) => {
    if (data == null) {
      console.log(`${path} not found`);
      res.status(202).end();
    } else {
      const theJson = JSON.parse(data.data);
      res.setHeader("content-type", data.metadata.contentType);
      res.status(200).json(theJson).end();
    }
  }, next);
});

export default router;
