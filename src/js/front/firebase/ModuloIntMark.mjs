import { Utiles } from "../../common/Utiles.mjs";
import MD5 from "../../../node_modules/blueimp-md5-es6/js/md5.js";
import { MiSeguridad } from "./MiSeguridad.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { ModuloPagina } from "../page/ModuloPagina.mjs";
import { Deferred } from "../../common/Deferred.mjs";

export class ModuloIntMark {
  static RAIZ = "/pgs";
  static diferidoId = new Deferred();
  static diferidoIdDone = false;
  static diferidoDb = new Deferred();
  static diferidoDbDone = false;
  static LLAVE_LOCAL_STORAGE = MD5(Utiles.getReferer());
  static opciones = {
    masterLoged: true,
    slaveLoged: false,
    masterIdUsr: false,
    slaveIdUsr: false, //Usar el user uid para crear la entrada en la base de datos firebase
    useFirebase: false,
  };

  static async computeDiferidoId() {
    const paquete = await ModuloIntMark.getDiferidoDb();
    console.log("diferidoDB ok");
    var db = paquete["database"];
    var ctx = paquete["ctx"];
    var principal = paquete["principal"];
    var tipoCliente = paquete["tipoCliente"];

    if (tipoCliente == "master") {
      console.log("master...");
      //Master:
      //La ruta de firebase debe quedar /pg/usrmaster/path/idpage/users
      let slaveUrl = null;
      let shortSlaveUrl = null;

      if (ctx != undefined) {
        slaveUrl = location.origin + location.pathname;
        if (
          typeof location.search == "string" &&
          location.search.trim().length > 0
        ) {
          slaveUrl +=
            location.search.replace(/(^\?|&)(pg=\d+)($|&)/, function (
              a,
              b,
              c,
              d
            ) {
              return b + d;
            }) +
            "&" +
            Utilidades.generateQueryParams({ pg: ctx["id"], sl: "si" });
          slaveUrl = slaveUrl.replace(/\?&/g, "?");
          slaveUrl = slaveUrl.replace(/&{2,}/g, "&");
        } else {
          slaveUrl +=
            "?" + Utilidades.generateQueryParams({ pg: ctx["id"], sl: "si" });
        }
        const respuesta = await fetch("/a/", {
          method: "POST",
          body: JSON.stringify({
            theurl: slaveUrl,
          }),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());

        shortSlaveUrl = location.origin + "/a/" + respuesta["id"];
      }

      if (ModuloIntMark.opciones.useFirebase) {
        var firebaseUrl =
          ModuloIntMark.RAIZ +
          "/" +
          principal.uid +
          location.pathname +
          "/" +
          ctx["id"]; //ruta dentro de firebase
        const crearMasterCtx = function () {
          var updates = {};
          updates[firebaseUrl] = {
            base: {
              time: new Date().getTime(),
            },
          };
          return db.ref().update(updates);
        };

        const snapshot = await db.ref(firebaseUrl).once("value");

        if (snapshot.val() == null) {
          await crearMasterCtx();
        }
        return {
          slaveUrl: shortSlaveUrl,
          tipo: tipoCliente,
          db: db,
          firebaseUrl: firebaseUrl,
          masterUrl: firebaseUrl,
          ctx: ctx,
          principal: principal,
        };
      } else {
        return {
          slaveUrl: shortSlaveUrl,
          tipo: tipoCliente,
          db: db,
          firebaseUrl: null,
          masterUrl: null,
          ctx: ctx,
          principal: principal,
        };
      }
    } else {
      console.log("slave...");
      if (ModuloIntMark.opciones.useFirebase) {
        var nuevaLlave;

        const urlParamCtx =
          ModuloIntMark.RAIZ +
          "/" +
          ctx["usr"] +
          location.pathname.replace(/[/]$/, "") +
          "/" +
          ctx["id"];

        if (ModuloIntMark.opciones.slaveIdUsr) {
          nuevaLlave = principal.uid;
        } else {
          nuevaLlave = ModuloIntMark.darIdAnonimo();
          if (nuevaLlave == null) {
            nuevaLlave = db
              .ref()
              .child(urlParamCtx + "/usr")
              .push().key;
            ModuloIntMark.asignarIdAnonimo(nuevaLlave);
          }
        }

        const firebaseUrl = urlParamCtx + "/usr/" + nuevaLlave;

        const crearSlaveCtx = function () {
          const updates = {};
          updates[firebaseUrl] = {
            time: new Date().getTime(),
          };
          return db.ref().update(updates);
        };

        const snapshot = await db.ref(firebaseUrl).once("value");
        if (snapshot.val() == null) {
          await crearSlaveCtx();
        }
        return {
          id: nuevaLlave,
          tipo: tipoCliente,
          db: db,
          firebaseUrl: firebaseUrl,
          masterUrl: urlParamCtx,
          ctx: ctx,
          principal: principal,
        };
      } else {
        return {
          id: null,
          tipo: tipoCliente,
          db: db,
          firebaseUrl: null,
          masterUrl: null,
          ctx: ctx,
          principal: principal,
        };
      }
    }
  }

  static async computeDiferidoDb() {
    await MiSeguridad.inicializar();
    const urlParam = Utilidades.getQueryParams(location.href);
    const unknownPage = [null, "", undefined].indexOf(urlParam["pg"]) >= 0;
    const isSlave = urlParam["sl"] == "si";
    const isMaster = !isSlave;
    const forzarUsuario =
      ((isMaster || unknownPage) && ModuloIntMark.opciones["masterLoged"]) ||
      ((isSlave || unknownPage) && ModuloIntMark.opciones["slaveLoged"]);
    const principal = await MiSeguridad.buscarUsuario(forzarUsuario);
    const contextoPagina = await ModuloPagina.leer(
      ModuloIntMark.opciones.sincronizar
    );
    const lecturaBasica = contextoPagina.valor;

    const hayUsuario = [null, undefined].indexOf(principal) < 0;

    var usuarioEsDuenio =
      hayUsuario && lecturaBasica["usr"] == principal["uid"];
    //es slave si lo solicita o si no es el duenio de la pagina
    var tipoCliente =
      isSlave || (hayUsuario && !usuarioEsDuenio) ? "slave" : "master";

    let database = null;
    if (ModuloIntMark.opciones.useFirebase) {
      database = firebase.database();
    }

    return {
      database: database, //Esto lo deberíamos sacar de acá
      principal: principal,
      ctx: lecturaBasica,
      tipoCliente: tipoCliente,
    };
  }

  /**
   * Retorna la promesa de la base de datos
   * @param opcionesUsr
   */
  static getDiferidoDb(opcionesUsr = {}) {
    if (!ModuloIntMark.diferidoDbDone) {
      ModuloIntMark.diferidoDbDone = true;
      Object.assign(ModuloIntMark.opciones, opcionesUsr);
      ModuloIntMark.computeDiferidoDb().then(
        function (datos) {
          ModuloIntMark.diferidoDb.resolve(datos);
        },
        function (error) {
          ModuloIntMark.diferidoDb.reject(error);
        }
      );
    }
    return ModuloIntMark.diferidoDb.promise;
  }

  static getDiferidoId(opcionesUsr = {}) {
    if (!ModuloIntMark.diferidoIdDone) {
      ModuloIntMark.diferidoIdDone = true;
      Object.assign(ModuloIntMark.opciones, opcionesUsr);
      ModuloIntMark.computeDiferidoId().then(
        function (datos) {
          ModuloIntMark.diferidoId.resolve(datos);
        },
        function (error) {
          ModuloIntMark.diferidoId.reject(error);
        }
      );
    }
    return ModuloIntMark.diferidoId.promise;
  }

  static getDiferidoIntMark(opcionesUsr = {}) {
    return ModuloIntMark.getDiferidoId(opcionesUsr);
  }

  static darIdAnonimo() {
    var temp = localStorage[ModuloIntMark.LLAVE_LOCAL_STORAGE];
    if (temp === undefined) {
      return null;
    }
    return temp;
  }

  static asignarIdAnonimo(id) {
    localStorage[ModuloIntMark.LLAVE_LOCAL_STORAGE] = id;
  }

  static afterSlave() {
    return new Promise((resolve) => {
      ModuloIntMark.diferidoId.promise.then(function (datos) {
        if (datos.tipo == "slave") {
          resolve(datos);
        }
      });
    });
  }

  static afterMaster() {
    return new Promise((resolve) => {
      ModuloIntMark.diferidoId.promise.then(function (datos) {
        if (datos.tipo == "master") {
          resolve(datos);
        }
      });
    });
  }

  static afterAny() {
    return new Promise((resolve) => {
      ModuloIntMark.diferidoId.promise.then(function (datos) {
        resolve(datos);
      });
    });
  }
}
