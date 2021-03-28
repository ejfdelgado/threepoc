import { Utiles } from "../../common/Utiles.mjs";
import MD5 from "../../../node_modules/blueimp-md5-es6/js/md5.js";
import { MiSeguridad } from "./MiSeguridad.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { ModuloPagina } from "../page/ModuloPagina.mjs";
import { Deferred } from "../../common/Deferred.mjs";

export class ModuloIntMark {
  static RAIZ = "/pgs";
  static diferidoId = null;
  static diferidoDB = null;
  static LLAVE_LOCAL_STORAGE = MD5(Utiles.getReferer());
  static opciones = {
    masterLoged: false,
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
    var ctx2 = paquete["ctx2"];
    var principal = paquete["principal"];
    var tipoCliente = paquete["tipoCliente"];

    if (tipoCliente == "master") {
      console.log("master...");
      //Master:
      //La ruta de firebase debe quedar /pg/usrmaster/path/idpage/users
      var firebaseUrl =
        ModuloIntMark.RAIZ +
        "/" +
        principal.uid +
        location.pathname +
        "/" +
        ctx["id"]; //ruta dentro de firebase
      var slaveUrl;

      if (
        typeof location.search == "string" &&
        location.search.trim().length > 0
      ) {
        slaveUrl =
          location.origin +
          location.pathname +
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
        slaveUrl =
          location.href +
          "?" +
          Utilidades.generateQueryParams({ pg: ctx["id"], sl: "si" });
      }

      const respuesta = await fetch("/a/", {
        method: "POST",
        body: JSON.stringify({
          theurl: slaveUrl,
        }),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());

      console.log("a ok...");
      if (ModuloIntMark.opciones.useFirebase) {
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
          slaveUrl: location.origin + "/a/" + respuesta["id"],
          tipo: tipoCliente,
          db: db,
          firebaseUrl: firebaseUrl,
          masterUrl: firebaseUrl,
          ctx: ctx,
          ctx2: ctx2,
          principal: principal,
        };
      } else {
        return {
          slaveUrl: location.origin + "/a/" + respuesta["id"],
          tipo: tipoCliente,
          db: db,
          firebaseUrl: null,
          masterUrl: null,
          ctx: ctx,
          ctx2: ctx2,
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
          ctx2: ctx2,
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
          ctx2: ctx2,
          principal: principal,
        };
      }
    }
  }

  static async computeDiferidoDb() {
    await MiSeguridad.inicializar();
    console.log(`miseguridad ok`);
    const urlParam = Utilidades.getQueryParams(location.href);
    const forzarUsuario =
      [null, "", undefined].indexOf(urlParam["pg"]) >= 0 ||
      ModuloIntMark.opciones["slaveLoged"] ||
      ModuloIntMark.opciones["slaveIdUsr"];
    const principal = await MiSeguridad.buscarUsuario(forzarUsuario);
    const contextoPagina = await ModuloPagina.leerTodo(
      ModuloIntMark.opciones.sincronizar
    );
    const lecturaBasica = contextoPagina[0].valor;
    const lecturaLarga = contextoPagina[1]; // Esto lo deberíamos sacar de acá

    var principalEsDuenio =
      [null, undefined].indexOf(principal) < 0 &&
      lecturaBasica["usr"] == principal["uid"];
    var solicitudSlave = urlParam["sl"] == "si";
    //es slave si lo solicita o si no es el duenio de la pagina
    var tipoCliente = solicitudSlave || !principalEsDuenio ? "slave" : "master";

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
    if (ModuloIntMark.diferidoDb == null) {
      ModuloIntMark.diferidoDb = new Deferred();
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
    if (ModuloIntMark.diferidoId == null) {
      ModuloIntMark.diferidoId = new Deferred();
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

  static async getDiferidoIntMark(opcionesUsr = {}) {
    return await ModuloIntMark.getDiferidoId(opcionesUsr);
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
}
