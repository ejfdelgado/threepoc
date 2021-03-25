import express from "express";
import datastorePackage from "@google-cloud/datastore";
import { Utilidades } from "../common/Utilidades.mjs";

const router = express.Router();
const { Datastore } = datastorePackage;
const datastore = new Datastore();

export class PageHandler {
  static KIND = "Pagina";
  static LIGTH_WEIGHT_KEYS = ["tit", "desc", "img", "q", "kw"];
  static LIGTH_WEIGHT_KEYS_ALL = [
    "tit",
    "desc",
    "img",
    "q",
    "kw",
    "date",
    "act",
  ];
  //GET
  /**
     * {
        "error":0,
        "valor":{
            "act":1602162437.9051368,
            "aut":"google.com/edgar.jose.fernando.delgado@gmail.com",
            "date":1602162437.905136,
            "desc":"Descripci\u00f3n",
            "id":5732110983757824,
            "img":"",
            "kw":"",
            "path":"/1/scan3d",
            "q":null,
            "tit":"T\u00edtulo",
            "usr":"HHN9uJFCjeVEOitjp8BCpJ4A9KI3"
        }
    }
     * @param req 
     * @param res 
     */
  static filtrarParametros(myrequest, filtro) {
    const buscables = {};
    if (typeof myrequest.query == "object") {
      myrequest = myrequest.query;
    }
    for (let i = 0; i < filtro.length; i++) {
      const key = filtro[i];
      buscables[key] = myrequest[key];
    }
    return buscables;
  }
  static leerRefererPath(myrequest) {
    const urlTotal = Utilidades.leerHeader(myrequest, [
      "Referer",
      "HTTP_REFERER",
    ]);
    const elhost = Utilidades.leerHeader(myrequest, [
      "host",
      "HTTP_HOST",
      "Host",
    ]);
    let elreferer = urlTotal;
    const elindice = elreferer.indexOf(elhost) + elhost.length;
    let temp = urlTotal.substr(elindice);
    let indiceQuery = temp.indexOf("?");
    if (indiceQuery >= 0) {
      temp = temp.substr(0, indiceQuery);
    }
    indiceQuery = temp.indexOf("#");
    if (indiceQuery >= 0) {
      temp = temp.substr(0, indiceQuery);
    }
    temp = temp.replace(/[\/]$/, "");
    return temp;
  }
  static async buscarPagina(request, usuario) {
    const AHORA = new Date().getTime() / 1000;
    const idPagina = Utilidades.leerNumero(request.query.pg);
    const crear = request.query.add;
    const buscables = PageHandler.filtrarParametros(
      request,
      PageHandler.LIGTH_WEIGHT_KEYS
    );
    const elpath = PageHandler.leerRefererPath(request);
    let temp = null;
    let unapagina = null;
    if (idPagina == null) {
      if (usuario != null) {
        const elUsuario = usuario.metadatos.uid;
        let datos = [];
        if ([undefined, null].indexOf(crear) >= 0) {
          // Si se manda el parámetro add, no se consulta y se crea uno nuevo...
          // select * from Pagina where path = "/1/trans" and usr = "HHN9uJFCjeVEOitjp8BCpJ4A9KI3"
          const query = datastore
            .createQuery(PageHandler.KIND)
            .filter("usr", "=", elUsuario)
            .filter("path", "=", elpath)
            .limit(1);
          datos = (await query.run())[0];
        }
        if (datos.length > 0) {
          // Ya existe y no lo debo crear
          unapagina = datos[0];
          temp = unapagina;
          temp.id = unapagina[datastore.KEY].id;
        } else {
          // Se debe crear
          const key = datastore.key([PageHandler.KIND]);
          unapagina = {
            key: key,
            data: {
              usr: elUsuario,
              aut: usuario.darId(),
              path: elpath,
              date: AHORA,
              act: AHORA,
            },
          };
          Object.assign(unapagina.data, buscables);
          await datastore.save(unapagina);
          temp = unapagina.data;
          temp.id = unapagina.key.id;
        }
        return temp;
      } else {
        throw new Error("Usuario no identificado");
      }
    } else {
      const key = datastore.key([PageHandler.KIND, idPagina]);
      temp = await new Promise((resolve, reject) => {
        datastore.get(key, function (err, entity) {
          if (err) {
            reject(err);
          } else {
            resolve(entity);
          }
        });
      });
      return temp;
    }
  }
  static async base(req, res) {
    const ans = { ok: true };
    ans["valor"] = await PageHandler.buscarPagina(req, req._user);
    res.status(200).json(ans).end();
  }
  //GET
  static async q2(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
  //GET
  static async q(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
  //PUT
  static async guardar(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
  //DELETE
  static async borrar(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
}

router.get("/q2/*", PageHandler.q2);
router.get("/q/*", PageHandler.q);
router.get("/*", PageHandler.base);
router.put("/*", PageHandler.guardar);
router.delete("/*", PageHandler.borrar);

export default router;
