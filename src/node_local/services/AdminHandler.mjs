import express from "express";
import admin from "firebase-admin";
var router = express.Router();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://proyeccion-colombia1.firebaseio.com",
});

export class Usuario {
  metadatos;
  static ADMINISTRADORES = ["google.com/edgar.jose.fernando.delgado@gmail.com"];
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

export default router;
