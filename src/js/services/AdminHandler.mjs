import express from "express";
import admin from "firebase-admin";
import datastorePackage from "@google-cloud/datastore";
import { StorageHandler } from "./StorageHandler.mjs";
import { Constants } from "../common/Constants.mjs";
import { PageHandler } from "./PageHandler.mjs";
import { TuplaHandler } from "./TuplaHandler.mjs";
import { Utilidades } from "../common/Utilidades.mjs";
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

  static async extractRoles(req) {
    const roles = [];

    let miPage = null;
    try {
      // Cargar la página para ver si el usuario actual es el owner
      miPage = await PageHandler.buscarPagina(req, req._user, true);
      if (miPage == null) {
        return;
      }
    } catch (e) {
      console.log(e);
      return;
    }

    // Se agregan los roles de la página
    if (miPage.pr instanceof Array) {
      for (let i = 0; i < miPage.pr.length; i++) {
        roles.push(miPage.pr[i]);
      }
    }

    if (req._user == null) {
      return;
    }

    // Se revisa si es administrador del sistema
    const userId = req._user.darId();
    if (Usuario.ADMINISTRADORES.indexOf(userId) >= 0) {
      roles.push("admin");
      roles.push("reader");
      roles.push("writer");
    }

    if (userId == miPage.aut) {
      roles.push("owner");
    }

    // Se complementa con los permisos que el usuario tiene en esa página
    const paginaKey = datastore.key([PageHandler.KIND, miPage.id]);
    const userIdFix = Buffer.from(userId).toString("base64");
    const queryTupla = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .filter("d", "=", "security")
      .filter("sd", "=", userIdFix)
      .filter("k", "=", "roles")
      .limit(1);
    //.select("v") // Requiere un índice

    const listaTupla = (await queryTupla.run())[0];
    if (listaTupla.length > 0) {
      try {
        const extra = JSON.parse(listaTupla[0].v);
        if (extra instanceof Array) {
          for (let i = 0; i < extra.length; i++) {
            roles.push(extra[i].v);
          }
        }
      } catch (e) {}
    }

    return roles;
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
        try {
          req._roles = await Usuario.extractRoles(req);
          if (req._user != null) {
            req._user.roles = req._roles;
          }
        } catch (e) {
          console.log(e);
        }
        next();
      })
      .catch((error) => {
        req._user = null;
        next();
      });
  }

  static authorize(roles = []) {
    if (typeof roles === "string") {
      roles = [roles];
    }

    return [
      (req, res, next) => {
        if (req._user != null) {
          if (roles.length > 0) {
            const resta = Utilidades.diff(roles, req._user.roles);
            if (resta.length > 0) {
              // user's role is not authorized
              return res.status(401).json({ message: "Unauthorized" });
            }
          }
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
        next();
      },
    ];
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
