import admin from "firebase-admin";
import datastorePackage from "@google-cloud/datastore";
import { Constants } from "../common/Constants.mjs";
import { PageHandler } from "./PageHandler.mjs";
import { TuplaHandler } from "./TuplaHandler.mjs";
import { Utilidades } from "../common/Utilidades.mjs";

const ROL_2_PERMISSION = {
  reader: ["rp", "rf", "rd"],
  writer: ["wp", "wf", "wd"],
  admin: ["rp", "rf", "rd", "wp", "wf", "wd"],
  owner: ["rp", "rf", "rd", "wp", "wf", "wd"],
};
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

  static translateRoles2Permission(roles = []) {
    const permissions = [];
    for (let i = 0; i < roles.length; i++) {
      const rol = roles[i];
      const permissionsAdded = ROL_2_PERMISSION[rol];
      if (permissionsAdded) {
        for (let j = 0; j < permissionsAdded.length; j++) {
          permissions.push(permissionsAdded[j]);
        }
      }
    }
    return Utilidades.removeDoubles(permissions);
  }

  static async extractRoles(req) {
    const roles = [];

    let miPage = null;
    try {
      // Cargar la página para ver si el usuario actual es el owner
      miPage = await PageHandler.buscarPagina(req, req._user, true);
      if (miPage == null) {
        return Utilidades.removeDoubles(roles);
      }
    } catch (e) {
      console.log(req._parsedUrl.href + " ... " + e);
      return roles;
    }

    // Se agregan los roles de la página
    if (miPage.pr instanceof Array) {
      for (let i = 0; i < miPage.pr.length; i++) {
        roles.push(miPage.pr[i]);
      }
    }

    if (req._user == null) {
      return Utilidades.removeDoubles(roles);
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
      roles.push("reader");
      roles.push("writer");
    }

    // Se complementa con los permisos que el usuario tiene en esa página
    const paginaKey = datastore.key([PageHandler.KIND, parseInt(miPage.id)]);
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
    return Usuario.translateRoles2Permission(roles);
  }

  static authDecorator(req, res, next) {
    const authorization = req.header("Authorization");
    const partes = /(OAuth|Bearer)(\s+)(.*)/.exec(authorization);
    if (partes == null) {
      Usuario.extractRoles(req).then(
        (roles) => {
          req._roles = roles;
          next();
        },
        () => {
          next();
        }
      );
      return;
    }
    admin
      .auth()
      .verifyIdToken(partes[3])
      .then(async (decodedToken) => {
        req._user = new Usuario(decodedToken);
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
      .catch(async (error) => {
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
        if (req._roles instanceof Array) {
          if (roles.length > 0) {
            const resta = Utilidades.diff(roles, req._roles);
            if (resta.length > 0) {
              // user's role is not authorized
              return res.status(401).json({ message: "Unauthorized1" });
            }
          }
        } else {
          return res.status(401).json({ message: "Unauthorized2" });
        }
        next();
      },
    ];
  }
}
