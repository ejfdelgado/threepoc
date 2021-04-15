import express from "express";
import admin from "firebase-admin";
import datastorePackage from "@google-cloud/datastore";
import { StorageHandler } from "./StorageHandler.mjs";
import { Constants } from "../common/Constants.mjs";
import { PageHandler } from "./PageHandler.mjs";
import { TuplaHandler } from "./TuplaHandler.mjs";
var router = express.Router();

const { Datastore } = datastorePackage;
const datastore = new Datastore();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: Constants.firebase.databaseURL,
});

export class Usuario {
  metadatos;
  static ADMINISTRADORES = Constants.ADMINISTRADORES;
  constructor(metadatos) {
    this.roles = [];
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
      roles: this.roles,
      proveedor: this.metadatos.firebase.sign_in_provider,
      sufijo: this.darUsername()["usuario"],
      uid: this.metadatos.user_id,
    };
    return ans;
  }

  async updateRoles(idPagina) {
    const userId = this.darId();
    this.roles = [];
    // 0. Se revisa si es administrador del sistema
    if (Usuario.ADMINISTRADORES.indexOf(userId) >= 0) {
      this.roles.push("admin");
    }
    // 1. Cargar la página para ver si el usuario actual es el owner
    const paginaKey = datastore.key([PageHandler.KIND, idPagina]);
    const queryPage = datastore
      .createQuery(PageHandler.KIND)
      //.select("aut")// Requiere un índice
      .filter("__key__", "=", paginaKey)
      .limit(1);

    // 2. Se complementa con los permisos de la página
    const userIdFix = Buffer.from(userId).toString("base64");
    const queryTupla = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .filter("d", "=", "security")
      .filter("sd", "=", userIdFix)
      .filter("k", "=", "roles")
      .limit(1);
    //.select("v") // Requiere un índice

    const resultados = await Promise.all([queryPage.run(), queryTupla.run()]);
    const listaPage = resultados[0][0];
    if (listaPage.length > 0) {
      const isOwner = userId == listaPage[0].aut;
      if (isOwner) {
        this.roles.push("owner");
      }
    }
    const listaTupla = resultados[1][0];
    if (listaTupla.length > 0) {
      try {
        const extra = JSON.parse(listaTupla[0].v);
        if (extra instanceof Array) {
          for (let i = 0; i < extra.length; i++) {
            this.roles.push(extra[i].v);
          }
        }
      } catch (e) {}
    }

    return this.roles;
  }

  static authDecorator(req, res, next) {
    const authorization = req.header("Authorization");
    const partes = /(OAuth|Bearer)(\s+)(.*)/.exec(authorization);
    if (partes == null) {
      next();
      return;
    }
    admin
      .auth()
      .verifyIdToken(partes[3])
      .then(async (decodedToken) => {
        const usuario = new Usuario(decodedToken);
        req._user = usuario;
        // Se intenta deducir de la url del request el idPagina
        const path = req._parsedUrl.path;
        // path: '/api/tup/all/?pg=5764529581457408&n=100&dom=external',
        const ID_PAGINA_SEARCH = [
          /\/api\/tup\/all\/.*pg=(\d+)/,
          /\/api\/tup\/(\d+)/,
        ];
        let idPage = null;
        for (let i = 0; i < ID_PAGINA_SEARCH.length; i++) {
          const partes = ID_PAGINA_SEARCH[i].exec(path);
          if (partes != null) {
            idPage = partes[1];
            break;
          }
        }
        if (idPage != null) {
          const roles = await req._user.updateRoles(parseInt(idPage));
          console.log(`roles=${roles}`);
        }
        next();
      })
      .catch((error) => {
        req._user = null;
        next();
      });
  }
}

router.get("/identidad", function (req, res) {
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
