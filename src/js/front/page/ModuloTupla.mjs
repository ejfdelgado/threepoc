import { ModuloPagina } from "./ModuloPagina.mjs";
import { ModuloTransformacion } from "../../common/ModuloTransformacion.mjs";
import MD5 from "../../../node_modules/blueimp-md5-es6/js/md5.js";
import { Deferred } from "../../common/Deferred.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";

export class ModuloTupla {
  static moduloTransformacion = ModuloTransformacion.modo("simple");

  constructor(opciones = {}) {
    this.diferidoLectura = null;
    this.memento = null;
    this.opciones = null;
    this.hashActual = {
      0: null,
      1: null,
    };
    this.opciones = Object.assign(
      {
        dom: "",
        sdom: "",
        N: 100,
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

  tomarImagen(valorActual, subllave) {
    const comp = ModuloTupla.darHash(valorActual);
    this.hashActual[subllave] = comp["md5"];
    return comp;
  }

  registrarMemento(plano) {
    let temp = JSON.parse(this.tomarImagen(plano, "1")["txt"]);
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
        };
        if (next != null) {
          queryParams["next"] = next;
        }
        const someurl = new URL(`${location.origin}/api/tup/all/`);
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
}
