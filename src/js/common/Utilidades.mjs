export class Utilidades {
  static trimSlashes(text) {
    return text.replace(/^[\/\\]+/g, "").replace(/[\/\\]+$/g, "");
  }
  static interpolate(text, o) {
    return text.replace(/[$]{([^{}]*)}/g,
          function (a, b) {
              var r = o[b];
              return typeof r === 'string' || typeof r === 'number' ? r : a;
          }
      );
  }
  static llenarYpersistir(
    nuevo,
    valoresNuevos,
    listanegra = [],
    puntos = false
  ) {
    const attrViejos = Object.keys(nuevo);
    const llavesNuevas = Object.keys(valoresNuevos);

    for (let i = 0; i < llavesNuevas.length; i++) {
      let key = llavesNuevas[i];
      const value = valoresNuevos[key];
      if (puntos) {
        key = key.replace(/[.]/g, "/");
      }
      if (!listanegra.includes(key)) {
        nuevo[key] = value;
      }
    }
    // Calculo los atributos que se deben borrar
    let restantes = attrViejos.filter((n) => !listanegra.includes(n));
    restantes = restantes.filter((n) => !llavesNuevas.includes(n));
    for (let i = 0; i < restantes.length; i++) {
      let key = restantes[i];
      if (puntos) {
        key = key.replace(/[.]/g, "/");
      }
      delete nuevo[key];
    }
    return nuevo;
  }

  static leerHeader(myrequest, lista) {
    for (let i = 0; i < lista.length; i++) {
      const a = lista[i];
      const val = myrequest.header(a);
      if (["", null, undefined].indexOf(val) < 0) {
        return val;
      }
      return null;
    }
  }
  static leerNumero(s) {
    if (typeof s == "string" || typeof s == "number") {
      const ans = parseInt(s);
      if (!isNaN(ans)) {
        return ans;
      }
    }
    return null;
  }
  static generateQueryParams(attributes) {
    const keys = Object.keys(attributes);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = attributes[key];
      if ([null, undefined].indexOf(val) >= 0) {
        delete attributes[key];
      }
    }
    return new URLSearchParams(attributes).toString();
  }
  static getQueryParams(fullUrl) {
    const params = {};
    if (typeof fullUrl != "string") {
      if (typeof location != "undefined") {
        fullUrl = location.href;
      } else {
        return params;
      }
    }
    const onlyQuery = fullUrl.replace(/^[^?]+[?]/, "").replace(/[#].*$/, "");
    const patron = /([^=&]+)=([^=&]+)/g;
    let match;
    do {
      match = patron.exec(onlyQuery);
      if (match != null) {
        const llave = match[1];
        const valor = match[2];
        params[llave] = decodeURI(valor);
      }
    } while (match != null);
    return params;
  }
  static hayValor(obj) {
    return obj !== null && obj !== undefined;
  }

  static esFuncion(functionToCheck) {
    return functionToCheck instanceof Function;
  }

  static esLista(value) {
    return value instanceof Array;
  }

  static esObjeto(obj) {
    return obj !== null && obj !== undefined && typeof obj == "object";
  }

  static is_null(valor) {
    return valor === null || typeof valor === "undefined";
  }

  static esNumero(dato) {
    return typeof dato == "number" || /^\d+$/.test(dato);
  }

  static esFlotante(dato) {
    return typeof dato == "number" || /^\s*\d+([\.,]\d*)?\s*$/.test(dato);
  }

  static darRutasObjeto(objOr, filtroObjetoAgregar, estructura) {
    var ans = [];
    var funcionRecursiva = function (obj, rutaActual, estructura) {
      if (Utilidades.esObjeto(obj)) {
        const llaves = Object.keys(obj);
        for (let i = 0; i < llaves.length; i++) {
          const llave = llaves[i];
          const valor = obj[llave];
          var llaveSiguiente = null;
          if (rutaActual === null) {
            llaveSiguiente = llave;
          } else {
            llaveSiguiente = rutaActual + "." + llave;
          }
          if (
            typeof filtroObjetoAgregar == "function" &&
            filtroObjetoAgregar(valor)
          ) {
            if (ans.indexOf(llaveSiguiente) < 0) {
              ans.push(llaveSiguiente);
            }
          }
          funcionRecursiva(valor, llaveSiguiente, estructura);
        }
        if (
          estructura === true &&
          rutaActual !== null &&
          ans.indexOf(rutaActual) < 0
        ) {
          ans.push(rutaActual);
        }
      } else {
        if (rutaActual !== null) {
          if (typeof filtroObjetoAgregar == "function") {
            if (filtroObjetoAgregar(obj)) {
              if (ans.indexOf(rutaActual) < 0) {
                ans.push(rutaActual);
              }
            }
          } else {
            if (ans.indexOf(rutaActual) < 0) {
              ans.push(rutaActual);
            }
          }
        }
      }
    };

    funcionRecursiva(objOr, null, estructura);
    return ans;
  }

  static leerObj(obj, nombres, predef, evitarInvocar, soportarNull) {
    if (!Utilidades.hayValor(nombres) || !Utilidades.esObjeto(obj)) {
      return predef;
    }
    var partes;
    try {
      if (typeof nombres == "number") {
        partes = [nombres];
      } else {
        partes = nombres.split(".");
      }
    } catch (e) {
      console.log("Error", e, "nombres", nombres);
      return predef;
    }
    var objetoActual = obj;
    for (var i = 0; i < partes.length; i++) {
      var llave = partes[i];
      if (Utilidades.esNumero(llave) && Utilidades.esLista(objetoActual)) {
        llave = parseInt(llave);
      }
      objetoActual = objetoActual[llave];
      if (i != partes.length - 1 && !Utilidades.esObjeto(objetoActual)) {
        return predef;
      }
    }
    if (!Utilidades.hayValor(objetoActual)) {
      if (soportarNull === true && objetoActual === null) {
        return objetoActual;
      }
      return predef;
    }
    if (evitarInvocar !== true && Utilidades.esFuncion(objetoActual)) {
      return objetoActual();
    }
    return objetoActual;
  }

  /*
    0,1 = tipo básico que sí se persiste
    2,3 = tipo estructural {} o []
    null = otro
    */
  static darTipoEstructura(dato) {
    if (dato === undefined) {
      return null;
    }
    if (dato === null) {
      return 0;
    }
    var proto = Object.getPrototypeOf(dato);
    if (
      [String.prototype, Number.prototype, Boolean.prototype].indexOf(proto) >=
      0
    ) {
      return 1;
    }
    if (proto === Object.prototype) {
      return 2;
    }
    if (proto === Array.prototype) {
      return 3;
    }
    return null;
  }
  static asignarObj(miObjeto, nombres, valor) {
    var debug = true;
    //if (debug) {console.log('Asignando ', nombres, 'con', valor);}
    var partes = nombres.split(".");
    var objetoActual = miObjeto;
    var esUltimo;
    var esObj;
    var anterior = null;
    var llaveAnterior = null;
    var esNumeroLlave;
    for (var i = 0; i < partes.length; i++) {
      var llave = partes[i];
      esNumeroLlave = Utilidades.esNumero(llave);
      if (esNumeroLlave) {
        llave = parseInt(llave);
      }
      esUltimo = i == partes.length - 1;
      esObj = typeof objetoActual == "object";
      //if (debug) {console.log('i=',i, 'llave=',llave,'esUltimo=',esUltimo,'esObj=',esObj);}

      if (!esObj && anterior != null && valor !== undefined) {
        //if (debug) {console.log('Forza a que sea objeto');}
        //Forza a que sea un objeto
        var nuevo;
        if (esNumeroLlave) {
          nuevo = [];
        } else {
          nuevo = {};
        }
        anterior[llaveAnterior] = nuevo;
        objetoActual = nuevo;
        esObj = true;
      }

      if (esObj) {
        if (esUltimo) {
          //Última iteración
          if (
            Utilidades.esLista(objetoActual[llave]) &&
            Utilidades.esLista(valor) &&
            objetoActual[llave] !== valor
          ) {
            objetoActual[llave].splice(0, objetoActual[llave].length);
            for (let nk = 0; nk < valor.length; nk++) {
              objetoActual[llave].push(valor[nk]);
            }
          } else {
            if (valor === undefined) {
              delete objetoActual[llave];
            } else {
              objetoActual[llave] = valor;
            }
          }
        } else {
          var tipoObj = typeof objetoActual;
          if (
            tipoObj != "object" ||
            Object.keys(objetoActual).indexOf("" + llave) < 0 ||
            objetoActual[llave] === null ||
            tipoObj == "undefined"
          ) {
            //Si la llave no existe en el objeto actual o si es nulo o indefinido
            //if (debug) {console.log('Creando siguiente objeto');}
            if (Utilidades.esNumero(partes[i + 1])) {
              objetoActual[llave] = [];
            } else {
              objetoActual[llave] = {};
            }
          }
          anterior = objetoActual;
          llaveAnterior = llave;
          objetoActual = objetoActual[llave];
        }
      } else {
        //if (debug) {console.log('Aborta en ', llave);}
        break;
      }
    }
  }
}
