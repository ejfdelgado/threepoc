import express from "express";
import datastorePackage from "@google-cloud/datastore";
import bodyParser from "body-parser";
import { Utilidades } from "../common/Utilidades.mjs";
import { NoAutorizadoException } from "../common/Errors.mjs";
import { NoExisteException } from "../common/Errors.mjs";
import { ParametrosIncompletosException } from "../common/Errors.mjs";
import { NoHayUsuarioException } from "../common/Errors.mjs";
import { PageHandler } from "./PageHandler.mjs";
import { Usuario } from "./AdminHandler.mjs";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const { Datastore } = datastorePackage;
const datastore = new Datastore();

// https://cloud.google.com/datastore/docs/concepts/transactions
// https://cloud.google.com/datastore/docs/concepts/entities

export class TuplaHandler {
  static MAX_LENGTH_FOR_INDEXING = 12;
  static KIND_TUPLA = "Tupla";
  static VACIOS = [null, "", undefined];
  static VACIOS2 = [null, undefined];

  static async borrarTuplasTodas(idPagina, n, user, dominio) {
    const transaction = datastore.transaction();
    await transaction.run();
    // Armo la llave padre
    const paginaKey = datastore.key([PageHandler.KIND, idPagina]);

    const query = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .limit(n)
      .select("__key__");

    if (typeof dominio == "string") {
      query.filter("d", dominio);
    }

    let datos = await query.run();
    const lista = datos[0];
    for (let i = 0; i < lista.length; i++) {
      const dato = lista[i];
      transaction.delete(dato[datastore.KEY]);
    }
    await transaction.commit();
  }

  static async crearTuplas(idPagina, peticion, user, dominio, useSd) {
    const transaction = datastore.transaction();
    await transaction.run();

    // Saco las llaves de la peticion
    const datosPayload = peticion.dat;
    const llaves = Object.keys(datosPayload);

    const datos = await TuplaHandler.buscarTuplas(
      idPagina,
      llaves,
      false,
      dominio,
      useSd
    );

    const amodificar = [];

    // Modifico los que existen
    for (let k = 0; k < datos.length; k++) {
      const existente = datos[k];
      let llave = existente.k;
      if (useSd) {
        llave = existente.sd + "." + llave;
      }
      const valNuevo = datosPayload[llave];
      Utilidades.remove(llaves, llave);
      if (existente.v != valNuevo) {
        existente.v = valNuevo;
        if (dominio != undefined) {
          existente.d = dominio;
        }
        amodificar.push({
          key: existente[datastore.KEY],
          data: {
            k: existente.k,
            sd: existente.sd,
            v: existente.v,
            d: existente.d,
          },
        });
      }
    }

    // Itero los que toca crear...
    for (let k = 0; k < llaves.length; k++) {
      let llave = llaves[k];
      let sd = null;
      if (useSd) {
        const partes = /^([^.]+)\.(.*)$/.exec(llave);
        sd = partes[1];
        llave = partes[2];
      }
      const key = datastore.key([
        PageHandler.KIND,
        idPagina,
        TuplaHandler.KIND_TUPLA,
      ]);
      const unatupla = {
        key: key,
        data: {
          k: llave,
          v: datosPayload[llaves[k]],
        },
      };
      if (useSd) {
        unatupla.data.sd = sd;
      }
      if (dominio != undefined) {
        unatupla.data.d = dominio;
      }
      amodificar.push(unatupla);
    }

    for (let k = 0; k < amodificar.length; k++) {
      const entidad = amodificar[k];
      if (typeof entidad.data.v == "string" && entidad.data.v.length > TuplaHandler.MAX_LENGTH_FOR_INDEXING) {
        entidad.excludeFromIndexes = ["v"];
      }
      await datastore.save(entidad);
    }

    await transaction.commit();
  }

  static async borrarTuplas(idPagina, llaves, user, dominio, useSd = false) {
    const transaction = datastore.transaction();
    await transaction.run();

    const datos = await TuplaHandler.buscarTuplas(
      idPagina,
      llaves,
      true,
      dominio,
      useSd
    );
    // Tomo las llaves
    for (let i = 0; i < datos.length; i++) {
      const dato = datos[i];
      transaction.delete(dato[datastore.KEY]);
    }
    if (datos.length > 0) {
      await transaction.commit();
    }
    return datos.length;
  }

  static async buscarTuplas(
    idPagina,
    llaves,
    soloLlave = false,
    dominio,
    useSd = false
  ) {
    // Armo la llave padre
    const paginaKey = datastore.key([PageHandler.KIND, idPagina]);
    const datos = [];
    // No existe la manera de hacer el operador IN..., entonces se hacen varias consultas a la vez
    for (let i = 0; i < llaves.length; i++) {
      let llave = llaves[i];
      let sd = null;
      if (useSd) {
        const partes = /^([^.]+)\.(.*)$/.exec(llave);
        sd = partes[1];
        llave = partes[2];
      }
      const query = datastore
        .createQuery(TuplaHandler.KIND_TUPLA)
        .hasAncestor(paginaKey)
        .filter("k", "=", llave)
        .limit(1);

      if (sd != null) {
        query.filter("sd", sd);
      }

      if (typeof dominio == "string") {
        query.filter("d", dominio);
      }

      if (soloLlave == true) {
        query.select("__key__");
      }
      let datosParciales = await query.run();
      const lista = datosParciales[0];
      for (let i = 0; i < lista.length; i++) {
        datos.push(lista[i]);
      }
    }
    return datos;
  }

  //-------------------------------------------------

  static async all(req, res, next) {
    const ans = {};
    ans["error"] = 0;

    let idPagina = req.query.pg;
    const dom = req.query.dom;
    const sdom = req.query.sdom;
    const siguiente = req.query.next;
    const n = Utilidades.leerNumero(req.query.n, 100);

    if (TuplaHandler.VACIOS.indexOf(idPagina) >= 0) {
      next(new ParametrosIncompletosException());
      return;
    }

    idPagina = parseInt(idPagina);

    const paginaKey = datastore.key([PageHandler.KIND, idPagina]);

    const query = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .limit(n);

    if (TuplaHandler.VACIOS2.indexOf(dom) < 0) {
      query.filter("d", "=", dom);
    }
    if (TuplaHandler.VACIOS2.indexOf(sdom) < 0) {
      query.filter("sd", "=", sdom);
    }
    if (TuplaHandler.VACIOS.indexOf(siguiente) < 0) {
      query.start(siguiente);
    }

    const response = await query.run();
    const datos = response[0];
    const pages = response[1];

    if (pages.moreResults == "MORE_RESULTS_AFTER_LIMIT") {
      //NO_MORE_RESULTS
      ans["next"] = pages.endCursor;
    }

    const dataF = [];
    for (let i = 0; i < datos.length; i++) {
      const dato = datos[i];
      const rta = {
        k: dato.k,
        v: dato.v,
      };
      if (typeof dato.sd == "string") {
        rta.k = dato.sd + "." + rta.k;
      }
      dataF.push(rta);
    }

    ans["ans"] = dataF;

    res.status(200).json(ans).end();
  }

  static async next(req, res, next) {
    const ans = {};
    ans["error"] = 0;

    const idPagina = req.query.pg;
    const dom = req.query.dom;
    const sdom = req.query.sdom;

    if (
      TuplaHandler.VACIOS.indexOf(idPagina) >= 0 ||
      TuplaHandler.VACIOS.indexOf(dom) >= 0
    ) {
      next(new ParametrosIncompletosException());
      return;
    }

    const paginaKey = datastore.key([PageHandler.KIND, idPagina]);

    const query = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .filter("d", "=", dom)
      .select("sd")
      .limit(1);

    if (TuplaHandler.VACIOS.indexOf(sdom) < 0) {
      query.filter("sd", "<", sdom);
    }
    query.order("sd", {
      descending: true,
    });

    const response = await query.run();
    const datos = response[0];

    if (datos.length > 0) {
      ans["ans"] = datos[0]["sd"];
    } else {
      ans["ans"] = null;
    }

    ans["ans"] = dataF;

    res.status(200).json(ans).end();
  }

  static async guardar(req, res, next) {
    const ans = {};
    ans["error"] = 0;
    const ident = parseInt(req.params[0]);
    let dominio;
    if (req.params[1] != undefined) {
      dominio = /\/(.*)/.exec(req.params[1])[1];
    }
    const usuario = req._user;

    const peticion = req.body;
    if (Object.keys(peticion).indexOf("dat") < 0) {
      next(new ParametrosIncompletosException());
      return;
    }

    const useSd = peticion["useSd"] == true;
    if (peticion["acc"] == "+") {
      ans["n"] = await TuplaHandler.crearTuplas(
        ident,
        peticion,
        usuario,
        dominio,
        useSd
      );
    } else if (peticion["acc"] == "-") {
      const llaves = peticion["dat"];
      ans["n"] = await TuplaHandler.borrarTuplas(
        ident,
        llaves,
        usuario,
        dominio,
        useSd
      );
    }

    res.status(200).json(ans).end();
  }

  static async borrar(req, res, next) {
    const ans = {};
    ans["error"] = 0;

    const ident = req.params[0];
    const usuario = req._user;
    let dominio;
    if (req.params[1] != undefined) {
      dominio = /\/(.*)/.exec(req.params[1])[1];
    }

    const idPagina = Utilidades.leerNumero(request.query.pg);
    const n = Utilidades.leerNumero(request.query.n, 100);

    if (TuplaHandler.VACIOS.indexOf(idPagina) >= 0) {
      next(new ParametrosIncompletosException());
      return;
    }

    ans["n"] = await TuplaHandler.borrarTuplasTodas(ident, n, usuario, dominio);

    res.status(200).json(ans).end();
  }
}

router.get("/all/*", Usuario.authorize("reader"), TuplaHandler.all);
router.get("/next/*", Usuario.authorize("reader"), TuplaHandler.next);
router.post(
  /\/(\d+)(\/.*)?/,
  Usuario.authorize("writer"),
  TuplaHandler.guardar
);
router.delete(
  /\/(\d+)(\/.*)?/,
  Usuario.authorize("writer"),
  TuplaHandler.borrar
);

export default router;
