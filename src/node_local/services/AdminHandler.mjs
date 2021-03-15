import express from "express";
import admin from "firebase-admin";
import { StorageHandler } from "./StorageHandler.mjs";
import { Constants } from "../common/Constants.mjs";
var router = express.Router();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: Constants.firebase.databaseURL,
});

export class Usuario {
  metadatos;
  static ADMINISTRADORES = Constants.ADMINISTRADORES;
  constructor(metadatos) {
    this.metadatos = metadatos;
  }
  darUsername() {
    let respuesta = null;
    if (this.metadatos != null) {
      const contenedor = this.metadatos["firebase"];
      const identidades = contenedor["identities"];
      respuesta = { dominio: contenedor["sign_in_provider"] };
      if ("email" in identidades) {
        respuesta["usuario"] = identidades["email"][0];
      } else if ("phone" in identidades) {
        respuesta["usuario"] = identidades["phone"][0];
      }
    }
    return respuesta;
  }

  darId() {
    let respuesta = null;
    if (this.metadatos != null) {
      const userName = this.darUsername(this.metadatos);
      respuesta = userName["dominio"] + "/" + userName["usuario"];
    }
    return respuesta;
  }

  getIdentity() {
    const ans = {
      id: this.darId(),
      roles: [],
      proveedor: this.metadatos.firebase.sign_in_provider,
      sufijo: this.darUsername()["usuario"],
      uid: this.metadatos.user_id,
    };
    if (Usuario.ADMINISTRADORES.indexOf(ans.id) >= 0) {
      ans.roles.push("admin");
    }
    return ans;
  }
}

router.get("/identidad", function (req, res) {
  const authorization = req.header("Authorization");
  const partes = /(OAuth|Bearer)(\s+)(.*)/.exec(authorization);
  admin
    .auth()
    .verifyIdToken(partes[3])
    .then((decodedToken) => {
      const usuario = new Usuario(decodedToken);
      const ans = usuario.getIdentity();
      res.status(200).json(ans).end();
    })
    .catch((error) => {
      console.log(error);
    });
});

/**
 * Se encarga de leer el api key de firebase
 */
router.get("/somedata", function (req, res) {
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
  });
});

export default router;
