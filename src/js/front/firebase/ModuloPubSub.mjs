import { ModuloIntMark } from "./ModuloIntMark.mjs";

export class ModuloPubSub {
  static llavesVolando = {};
  //Acá se crea el SUB del Bus
  static sub(topico, funcion) {
    if (!(ModuloPubSub.llavesVolando[topico] instanceof Array)) {
      ModuloPubSub.llavesVolando[topico] = [];
    }
    ModuloIntMark.afterAny().then(function (datos) {
      if (datos["masterUrl"] === null) {
        console.log("Debe incializar moduloIntMark con useFirebase en true");
        return;
      }
      var db = datos["db"];
      var firebaseUrl = datos["masterUrl"];

      var ref = db.ref(firebaseUrl + "/pubsub/" + topico);
      var escuchador = ref.on("value", function (snapshot) {
        var valor = snapshot.val();
        if (valor != null) {
          var llaves = Object.keys(valor);
          for (var j = 0; j < llaves.length; j++) {
            var llave = llaves[j];
            var indiceLlave = -1;
            indiceLlave = ModuloPubSub.llavesVolando[topico].indexOf(llave);
            if (indiceLlave >= 0) {
              //Es una llave que yo mismo generé
              ModuloPubSub.llavesVolando[topico].splice(indiceLlave, 1);
            } else {
              try {
                var valLocal = JSON.parse(valor[llave]);
                funcion(valLocal);
              } catch (e) {}
            }
          }
        }
      });
    });
  }

  //Acá se crea el PUB del Bus
  static pub(topico, objeto) {
    var diferido = $.Deferred();
    ModuloIntMark.afterAny().then(
      function (datos) {
        if (datos["masterUrl"] === null) {
          console.log("Debe incializar moduloIntMark con useFirebase en true");
          return;
        }
        var llavePubSub = datos["masterUrl"] + "/pubsub/" + topico;
        var updates = {};
        var nuevaLlave = datos["db"].ref().child(llavePubSub).push().key;
        if (ModuloPubSub.llavesVolando[topico] instanceof Array) {
          ModuloPubSub.llavesVolando[topico].push(nuevaLlave);
        }
        var llavePubSub2 = llavePubSub + "/" + nuevaLlave;
        updates[llavePubSub2] = JSON.stringify(objeto);
        datos["db"]
          .ref()
          .update(updates)
          .then(
            function () {
              //Acá los borro
              updates[llavePubSub2] = null;
              datos["db"]
                .ref()
                .update(updates)
                .then(
                  function () {
                    diferido.resolve();
                  },
                  function () {
                    diferido.resolve();
                  }
                );
            },
            function () {
              diferido.reject();
            }
          );
      },
      function () {
        diferido.reject();
      }
    );
    return diferido;
  }
}
