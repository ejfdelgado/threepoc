import express from "express";
import datastorePackage from "@google-cloud/datastore";
import bodyParser from "body-parser";
import { Utilidades } from "../common/Utilidades.mjs";
import { NoAutorizadoException } from "../common/Errors.mjs";
import { NoExisteException } from "../common/Errors.mjs";
import { ParametrosIncompletosException } from "../common/Errors.mjs";
import { NoHayUsuarioException } from "../common/Errors.mjs";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const { Datastore } = datastorePackage;
const datastore = new Datastore();

// https://cloud.google.com/datastore/docs/concepts/transactions
// https://cloud.google.com/datastore/docs/concepts/entities

export class TuplaHandler {
  static KIND_PAGINA = "Pagina";
  static KIND_TUPLA = "Tupla";
  static VACIOS = [null, "", undefined];

  static async borrarTuplasTodas(idPagina, n, user) {
    const transaction = datastore.transaction();
    await transaction.run();
    // Armo la llave padre
    const paginaKey = datastore.key([TuplaHandler.KIND_PAGINA, idPagina]);

    const query = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .filter("i", "=", idPagina)
      .limit(n)
      .select("__key__");
    datos = await query.run();
    console.log(datos);
    await transaction.commit();
  }

  static async crearTuplas(idPagina, peticion, user) {
    const transaction = datastore.transaction();
    await transaction.run();

    // Armo la llave padre
    const paginaKey = datastore.key([TuplaHandler.KIND_PAGINA, idPagina]);
    // Saco las llaves de la peticion
    const llaves = [];
    const datosPayload = peticion["dat"];
    const llavesPayload = Object.keys(datosPayload);
    for (let i = 0; i < llavesPayload.length; i++) {
      const llavePayload = llavesPayload[i];
      llaves.append(llavePayload);
    }

    const datos = await TuplaHandler.buscarTuplas(idPagina, llaves);

    console.log(datos);

    await transaction.commit();
  }

  static async borrarTuplas(idPagina, llaves, user) {
    const transaction = datastore.transaction();
    await transaction.run();

    const datos = await TuplaHandler.buscarTuplas(idPagina, llaves, true);

    const llavesBorrar = [];
    // Tomo las llaves
    for (let i = 0; i < datos.length; i++) {
      // TODO sí se accede así la llave??
      console.log(dato.key);
      transaction.delete(dato.key);
      llavesBorrar.append(dato.key);
    }
    if (llavesBorrar.length > 0) {
      await transaction.commit();
    }
    return len(llavesBorrar);
  }

  static async buscarTuplas(idPagina, llaves, soloLlave = false) {
    // Armo la llave padre
    const paginaKey = datastore.key([TuplaHandler.KIND_PAGINA, idPagina]);
    const datos = [];
    // No existe la manera de hacer el operador IN..., entonces se hacen varias consultas a la vez
    for (let i = 0; i < llaves.length; i++) {
      const llave = llaves[i];
      const query = datastore
        .createQuery(TuplaHandler.KIND_TUPLA)
        .hasAncestor(paginaKey)
        .filter("i", "=", idPagina)
        .filter("k", "=", llave)
        .limit(1);

      if (soloLlave == true) {
        query.select("__key__");
      }
      datos = await query.run();
      const unapagina = datos[0];
      datos.append(unapagina);
    }
    return datos;
  }

  //-------------------------------------------------

  static async fecha(req, res) {
    const ans = {};
    ans["error"] = 0;
    ans["unixtime"] = new Date().getTime();
    res.status(200).json(ans).end();
  }

  static async all(req, res, next) {
    const ans = {};
    ans["error"] = 0;

    const idPagina = req.query.pg;
    const dom = req.query.dom;
    const sdom = req.query.sdom;
    const siguiente = req.query.next;
    const n = Utilidades.leerNumero(req.query.n, 100);

    if (TuplaHandler.VACIOS.indexOf(idPagina) >= 0) {
      next(new ParametrosIncompletosException());
      return;
    }

    const paginaKey = datastore.key([TuplaHandler.KIND_PAGINA, idPagina]);

    const query = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .filter("i", "=", idPagina)
      .limit(n);

    if (TuplaHandler.VACIOS.indexOf(dom) < 0) {
      query.filter("d", "=", dom);
    }
    if (TuplaHandler.VACIOS.indexOf(sdom) < 0) {
      query.filter("sd", "=", sdom);
    }
    if (TuplaHandler.VACIOS.indexOf(siguiente) < 0) {
      query.start(siguiente);
    }

    const response = await query.run();
    const datos = response[0];
    const pages = response[1];

    if (pages.moreResults == "MORE_RESULTS_AFTER_LIMIT") {
      ans["next"] = pages.endCursor;
    }

    const dataF = [];
    for (let i = 0; i < datos.length; i++) {
      const dato = datos[i];
      dataF.push({
        k: dato.k,
        v: dato.v,
      });
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

    const paginaKey = datastore.key([TuplaHandler.KIND_PAGINA, idPagina]);

    const query = datastore
      .createQuery(TuplaHandler.KIND_TUPLA)
      .hasAncestor(paginaKey)
      .filter("i", "=", idPagina)
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

    const ident = req.params[0];
    const usuario = req._user;

    const peticion = req.body;

    if (Object.keys(peticion).indexOf("dat") < 0) {
      next(new ParametrosIncompletosException());
      return;
    }

    if (peticion["acc"] == "+") {
      ans["n"] = await TuplaHandler.crearTuplas(ident, peticion, usuario);
    } else if (peticion["acc"] == "-") {
      const llaves = peticion["dat"];
      ans["n"] = await TuplaHandler.borrarTuplas(ident, llaves, usuario);
    }

    res.status(200).json(ans).end();
  }

  static async borrar(req, res, next) {
    const ans = {};
    ans["error"] = 0;

    const ident = req.params[0];
    const usuario = req._user;

    const idPagina = Utilidades.leerNumero(request.query.pg);
    const n = Utilidades.leerNumero(request.query.n, 100);

    if (TuplaHandler.VACIOS.indexOf(idPagina) >= 0) {
      next(new ParametrosIncompletosException());
      return;
    }

    ans["n"] = await TuplaHandler.borrarTuplasTodas(ident, n, usuario);

    res.status(200).json(ans).end();
  }
}

router.get("/fecha", TuplaHandler.fecha);
router.get("/all/*", TuplaHandler.all);
router.get("/next/*", TuplaHandler.next);
router.post("/*", TuplaHandler.guardar);
router.delete("/*", TuplaHandler.borrar);

export default router;
