import { Utilidades } from "./Utilidades.mjs";

export class ModuloTransformacionSimple {
  /**
   *
   * @param objeto
   * @param cod
   * @param estruct
   */
  static to(objeto, cod, estruct, opcionesIn = {}) {
    var respuesta = {};
    const opciones = Object.assign(
      {
        keysNoBreak: [],
      },
      opcionesIn
    );

    let funFilter = null;
    const listaKeysNoBreak = opciones.keysNoBreak;
    if (listaKeysNoBreak.length > 0) {
      funFilter = function (data, key) {
        for (let i = 0; i < listaKeysNoBreak.length; i++) {
          const patronText = listaKeysNoBreak[i];
          if (key.startsWith(patronText)) {
            return false;
          }
        }
        return true;
      };
    }

    var llaves = Utilidades.darRutasObjeto(objeto, funFilter, estruct);
    if (cod === true) {
      for (var i = 0; i < llaves.length; i++) {
        var llave = llaves[i];
        var val = Utilidades.leerObj(objeto, llave, undefined, undefined, true);
        if (val !== undefined) {
          var tipEstruct = Utilidades.darTipoEstructura(val);
          if ([0, 1].indexOf(tipEstruct) >= 0) {
            //tipo básico
            val = JSON.stringify(val);
          } else if (estruct === true && [2, 3].indexOf(tipEstruct) >= 0) {
            //Es tipo estructura
            const serializar = funFilter == null || !funFilter(null, llave);
            if (serializar) {
              val = JSON.stringify(val);
            } else {
              if (tipEstruct == 2) {
                val = "{}";
              } else if (tipEstruct == 3) {
                val = "[]";
              }
            }
          }
        }
        respuesta[llave] = val;
      }
    } else {
      for (var i = 0; i < llaves.length; i++) {
        var llave = llaves[i];
        respuesta[llave] = Utilidades.leerObj(objeto, llave, null);
      }
    }
    return respuesta;
  }

  static from(objeto, cod) {
    var respuesta = {};
    var llaves = Object.keys(objeto);
    if (cod === true) {
      //Se ordena
      llaves.sort(function (a, b) {
        return a.length - b.length;
      });
      //Primero se recupera la estructura
      var j = 0;
      while (j < llaves.length) {
        var llave = llaves[j];
        var dato = objeto[llave];
        if (dato === "{}") {
          Utilidades.asignarObj(respuesta, "ans." + llave, {});
          llaves.splice(j, 1);
        } else if (dato === "[]") {
          Utilidades.asignarObj(respuesta, "ans." + llave, []);
          llaves.splice(j, 1);
        } else {
          j++;
        }
      }
      //Luego se asignan los datos
      for (var i = 0; i < llaves.length; i++) {
        var llave = llaves[i];
        var dato = objeto[llave];
        try {
          dato = JSON.parse(dato);
        } catch (e) {}
        Utilidades.asignarObj(respuesta, "ans." + llave, dato);
      }
    } else {
      for (var i = 0; i < llaves.length; i++) {
        var llave = llaves[i];
        var dato = objeto[llave];
        Utilidades.asignarObj(respuesta, "ans." + llave, dato);
      }
    }
    return respuesta["ans"];
  }
}

export class ModuloTransformacionBasico {}

export class ModuloTransformacion {
  static modos = {};

  static registrar(llave, valor) {
    ModuloTransformacion.modos[llave] = valor;
  }

  static modo(llave) {
    return ModuloTransformacion.modos[llave];
  }
}

ModuloTransformacion.registrar("basico", ModuloTransformacionBasico);
ModuloTransformacion.registrar("simple", ModuloTransformacionSimple);
