import { ModuloPagina } from "./ModuloPagina.mjs";
import { ModuloTransformacion } from "../../common/ModuloTransformacion.mjs";
import MD5 from "../../../node_modules/blueimp-md5-es6/js/md5.js";
import { Deferred } from "../../common/Deferred.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { ModuloActividad } from "../common/ModuloActividad.mjs";

export class ModuloTupla {
  static moduloTransformacion = ModuloTransformacion.modo("simple");
  static LOCATION_WITHOUT_PAGE = Utilidades.recomputeUrl(location);

  constructor(opciones = {}) {
    this.diferidoLectura = null;
    this.memento = null;
    this.hashActual = null;
    this.opciones = Object.assign(
      {
        dom: null,
        sdom: null,
        N: 100,
        useSubDomain: false,
      },
      opciones
    );
  }

  static darHash(dato) {
    const ans = {
      txt: JSON.sortify(dato),
    };
    ans["md5"] = MD5(ans["txt"]);
    return ans;
  }

  esDiferente = function (dato) {
    return hashActual != ModuloTupla.darHash(dato)["md5"];
  };

  tomarImagen(valorActual) {
    const comp = ModuloTupla.darHash(valorActual);
    this.hashActual = comp["md5"];
    return comp;
  }

  registrarMemento(plano) {
    let temp = JSON.parse(this.tomarImagen(plano)["txt"]);
    this.memento = {
      v: temp,
      k: Object.keys(temp),
    };
    //Debe convertir de version plana
    temp = ModuloTupla.moduloTransformacion.from(plano, true);
    if (typeof temp == "undefined") {
      temp = {};
    }
    return temp;
  }

  async leer() {
    if (this.diferidoLectura == null) {
      this.diferidoLectura = new Deferred();
      const respuestaPagina = await ModuloPagina.leer();
      if ([undefined, null].indexOf(respuestaPagina.valor) >= 0) {
        this.diferidoLectura.reject(new Error("No hay página"));
        return this.diferidoLectura.promise;
      }
      const idPagina = respuestaPagina.valor.id;
      const todo = {};
      let next = null;

      const totalizar = () => {
        const valorActual = this.registrarMemento(todo);
        this.diferidoLectura.resolve(valorActual);
      };

      const recursiva = async () => {
        const queryParams = {
          pg: idPagina,
          n: this.opciones.N,
          dom: this.opciones.dom,
          sdom: this.opciones.sdom,
        };
        if (next != null) {
          queryParams["next"] = next;
        }
        const someurl = new URL(
          `${ModuloTupla.LOCATION_WITHOUT_PAGE.origin}/api/tup/all/`
        );
        someurl.search = Utilidades.generateQueryParams(queryParams);
        const rta = await fetch(someurl, { method: "GET" }).then((res) =>
          res.json()
        );
        const lista = rta.ans;
        for (let i = 0; i < lista.length; i++) {
          todo[lista[i].k] = lista[i].v;
        }
        if (rta["next"] == null || lista.length == 0) {
          totalizar();
        } else {
          next = rta["next"];
          await recursiva();
        }
      };

      await recursiva();
    }
    return this.diferidoLectura.promise;
  }

  async guardar(modelo, lpatrones, sincronizar, misopciones) {
    let dominio = "";
    if (typeof this.opciones.dom == "string") {
      dominio = "/" + this.opciones.dom;
    }
    const opcTra = {};
    if (this.opciones.useSubDomain) {
      opcTra.keysNoBreak = ["^[^.]+\\.[^.]+"];
      opcTra.includeBase = false;
    }
    misopciones = Object.assign(
      {
        actividad: true,
      },
      misopciones
    );
    let actividad = null;
    if (misopciones.actividad) {
      actividad = ModuloActividad.on();
    }
    const diferido = new Deferred();

    await this.leer();
    const respuestaPagina = await ModuloPagina.leer();
    const valor = respuestaPagina.valor;
    const idPagina = valor.id;

    //Debe calcular la diferencia entre:
    const payload = {
      "+": [], //crear
      "*": {}, //modificar
      "-": [], //borrar
    };
    var valNuevos = ModuloTupla.moduloTransformacion.to(
      modelo,
      true,
      true,
      opcTra
    );
    if (typeof valNuevos == "undefined") {
      valNuevos = {};
    }
    var nuevoKeys = Object.keys(valNuevos);
    var viejoKeys = this.memento["k"];

    var valViejos = this.memento["v"];

    //Lo que debe crear
    payload["+"] = Utilidades.diff(nuevoKeys, viejoKeys);
    //Lo que debe eliminar
    payload["-"] = Utilidades.diff(viejoKeys, nuevoKeys);
    //Lo que debe modificar
    var restantes = nuevoKeys;
    restantes = Utilidades.diff(restantes, payload["+"]);
    restantes = Utilidades.diff(restantes, payload["-"]);

    for (var i = 0; i < restantes.length; i++) {
      var llave = restantes[i];
      var cambio = false;
      var val0 = valViejos[llave];
      var val1 = valNuevos[llave];
      if (val0 !== val1) {
        if (val0 == null || val1 == null) {
          //Alguno de los dos es nulo
          cambio = true;
        } else {
          cambio = "" + val0 !== "" + val1;
        }
      }
      if (cambio) {
        payload["*"][llave] = val1;
      }
    }
    //Cambio las listas por objetos
    var mapaNuevo;
    var listaNueva;

    mapaNuevo = {};
    listaNueva = payload["+"];
    for (var i = 0; i < listaNueva.length; i++) {
      var llave = listaNueva[i];
      mapaNuevo[llave] = valNuevos[llave];
    }
    payload["+"] = mapaNuevo;

    //Itero en grupos de 30...
    //Google define que maximo se pueden hacer 30
    var N = 30;
    //Hago una copia...
    valViejos = JSON.parse(JSON.stringify(valViejos));
    var unionCrearModificar = {};
    for (llave in payload["+"]) {
      unionCrearModificar[llave] = payload["+"][llave];
    }
    for (llave in payload["*"]) {
      unionCrearModificar[llave] = payload["*"][llave];
    }
    var funcionFinal = () => {
      var reconstruido = this.registrarMemento(valViejos);
      this.diferidoLectura = new Deferred();
      this.diferidoLectura.resolve(reconstruido);
      if (actividad != null) {
        actividad.resolve();
      }
    };

    var diferidoCreacion = new Deferred();
    var diferidoEliminacion = new Deferred();

    var recursivaModificar = async () => {
      console.log("modificando...");
      var subgrupo = {};
      var conteo = 0;
      for (llave in unionCrearModificar) {
        if (conteo >= N) {
          break;
        }
        subgrupo[llave] = unionCrearModificar[llave];
        delete unionCrearModificar[llave];
        conteo++;
      }
      if (conteo == 0) {
        //Se acabo
        diferidoCreacion.resolve();
      } else {
        //Hace invocacion a servicio
        //console.log('invocando servicio + con', JSON.stringify(subgrupo));
        var subdatos = { dat: subgrupo, acc: "+" };
        if (this.opciones.useSubDomain) {
          subdatos.useSd = true;
        }
        if (lpatrones instanceof Array) {
          subdatos["patr"] = lpatrones;
        }
        const url = new URL(
          `${ModuloTupla.LOCATION_WITHOUT_PAGE.origin}/api/tup/${idPagina}${dominio}`
        );
        await fetch(url, {
          method: "POST",
          body: JSON.stringify(subdatos),
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json());
        for (let unallave in subgrupo) {
          valViejos[unallave] = subgrupo[unallave];
        }
        /*
        if (sincronizar === true) {
          moduloPubSub.pub('sync', subdatos);	
        }
        */
        await recursivaModificar();
      }
    };

    await recursivaModificar();

    var recursivaEliminar = async () => {
      console.log("eliminando...");
      var subgrupo = payload["-"].splice(0, N);
      if (subgrupo.length == 0) {
        //Se acabo
        diferidoEliminacion.resolve();
      } else {
        //Hace invocacion a servicio
        //console.log('invocando servicio - con', JSON.stringify(subgrupo));
        var payloadLocal = { dat: subgrupo, acc: "-" };
        const url = new URL(
          `${ModuloTupla.LOCATION_WITHOUT_PAGE.origin}/api/tup/${idPagina}${dominio}`
        );
        await fetch(url, {
          method: "POST",
          body: JSON.stringify(payloadLocal),
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => res.json());

        for (var j = 0; j < subgrupo.length; j++) {
          delete valViejos[subgrupo[j]];
        }
        /*
        if (sincronizar === true) {
          moduloPubSub.pub("sync", payloadLocal);
        }
        */
        await recursivaEliminar();
      }
    };

    await recursivaEliminar();

    diferidoEliminacion.promise.then(function () {
      diferido.resolve();
    });

    diferido.promise.then(function () {
      console.log("terminó");
      funcionFinal();
    });

    return diferido.promise;
  }
}
