import express from "express";
import datastorePackage from "@google-cloud/datastore";
import bodyParser from "body-parser";
import { Utilidades } from "../common/Utilidades.mjs";
import { NoAutorizadoException } from "../common/Errors.mjs";
import { NoExisteException } from "../common/Errors.mjs";
import { ParametrosIncompletosException } from "../common/Errors.mjs";
import { NoHayUsuarioException } from "../common/Errors.mjs";
import { Usuario } from "./AdminHandler.mjs";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const { Datastore } = datastorePackage;
const datastore = new Datastore();

// https://googleapis.dev/nodejs/datastore/latest/Datastore.html#get
// https://googleapis.dev/nodejs/datastore/latest/Datastore.html#delete

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
  static getQueryParamPg(request, fromReferer) {
    if (fromReferer) {
      const urlTotal = Utilidades.leerHeader(request, [
        "Referer",
        "HTTP_REFERER",
      ]);
      const partes = /pg=(\d+)/.exec(urlTotal);
      if (partes != null) {
        return partes[1];
      }
    } else {
      return request.query.pg;
    }
  }
  static async buscarPaginaSimple(request, fromReferer) {
    const pgQueryParam = PageHandler.getQueryParamPg(request, fromReferer);
    const idPagina = Utilidades.leerNumero(pgQueryParam);
    if (idPagina == null) {
      return null;
    }
    const entity = await PageHandler.getPageById(idPagina);
    if (entity == null) {
      return null;
    }
    entity.id = entity[datastore.KEY].id;
    return entity;
  }
  static async buscarPagina(request, usuario, fromReferer = false) {
    const pagina = await PageHandler.buscarPaginaSimple(request, fromReferer);
    if (pagina != null) {
      return pagina;
    }
    const AHORA = new Date().getTime() / 1000;
    const crear = request.query.add;
    const buscables = PageHandler.filtrarParametros(
      request,
      PageHandler.LIGTH_WEIGHT_KEYS
    );
    const elpath = PageHandler.leerRefererPath(request);
    let temp = null;
    let unapagina = null;

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
      throw new NoHayUsuarioException();
    }
  }

  static async getPageById(idPagina) {
    const key = datastore.key([PageHandler.KIND, idPagina]);
    const lista = await datastore.get(key);
    if (lista.length > 0) {
      return lista[0];
    }
    return null;
  }

  static async guardarInterno(request, usuario = null) {
    const AHORA = new Date().getTime() / 1000;
    const ans = {};
    ans["error"] = 0;
    const peticion = request.body;
    const idPagina = Utilidades.leerNumero(request.query.pg);
    if (idPagina != null) {
      const modelo = await PageHandler.getPageById(idPagina);
      if (modelo != null) {
        if (usuario == null || modelo["usr"] != usuario.metadatos.uid) {
          throw new NoAutorizadoException();
        } else {
          peticion["act"] = AHORA;
          Utilidades.llenarYpersistir(
            modelo,
            peticion,
            ["usr", "path", "date", "id", "aut", datastore.KEY],
            true
          );
          await datastore.save(modelo);
          //const elpath = PageHandler.leerRefererPath(request);
          //const buscables = PageHandler.filtrarParametros(
          //  request,
          //  PageHandler.LIGTH_WEIGHT_KEYS_ALL
          //);
          //Optimizar, si no ha cambiado, no recrear
          //DocHandler.actualizar(str(idPagina), usuario, elpath, buscables)
          modelo.id = modelo[datastore.KEY].id;
          ans["valor"] = modelo;
        }
      } else {
        throw new NoExisteException();
      }
    } else {
      throw new ParametrosIncompletosException();
    }
    return ans;
  }

  static async borrarInterno(request, usuario = null) {
    const ans = {};
    ans["error"] = 0;
    const idPagina = Utilidades.leerNumero(request.query.pg);
    if (idPagina != null) {
      const modelo = await PageHandler.getPageById(idPagina);
      if (modelo != null) {
        if (
          modelo["usr"] != null &&
          (usuario == null || modelo["usr"] != usuario.metadatos.uid)
        ) {
          throw new NoAutorizadoException();
        } else {
          await datastore.delete(modelo[datastore.KEY]);
          //DocHandler.borrar(str(idPagina), usuario)
        }
      } else {
        throw new NoExisteException();
      }
    } else {
      throw new ParametrosIncompletosException();
    }
    return ans;
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
    const ans = await PageHandler.guardarInterno(req, req._user);
    res.status(200).json(ans).end();
  }
  //DELETE
  static async borrar(req, res) {
    const ans = await PageHandler.borrarInterno(req, req._user);
    res.status(200).json(ans).end();
  }
}

router.get("/q2/*", Usuario.authorize("reader"), PageHandler.q2);
router.get("/q/*", Usuario.authorize("reader"), PageHandler.q);
router.get("/*", Usuario.authorize("reader"), PageHandler.base);
router.put("/*", Usuario.authorize("owner"), PageHandler.guardar);
router.delete("/*", Usuario.authorize("owner"), PageHandler.borrar);

export default router;
