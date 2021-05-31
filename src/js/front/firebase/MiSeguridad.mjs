/*

Recordar:
https://console.developers.google.com/apis/credentials
En OAuth 2.0 client IDs:
Agregar los dominios desde donde se puede acceder.

Para probar en local:
En el archivo:
C:\Windows\System32\Drivers\etc\hosts
Agregar el dominio de desarrollo
127.0.0.1       proyeccion-colombia1.appspot.com

EN Run Configurations:
"${workspace_loc:CMGAE2}" --admin_port=9000 --port 80 --enable_host_checking=false

<div id="firebaseui-auth-container" class="invisible"></div>
<div id="sign-in-status"></div>
<div id="account-details"></div>
<div id="sign-in"></div>


miseguridad.salir().then(function() {
	//Salió!
});
 */

import { Utiles } from "../../common/Utiles.mjs";
import { ModuloActividad } from "../common/ModuloActividad.mjs";
import { ModuloPagina } from "../page/ModuloPagina.mjs";
import { Utilidades } from "../../common/Utilidades.mjs";
import { ModuloDatoSeguro } from "../../common/ModuloDatoSeguro.mjs";
import { ModuloModales } from "../common/ModuloModales.mjs";

export class MiSeguridad {
  static diferidoConf = null;
  static diferidoApp = null;
  static config = {};
  static diferidoFirebase = null;
  static datosLocales = {};
  static diferidoDatos = null;
  static PARTE_1 =
    "MIHDAgEAMA0GCSqGSIb3DQEBAQUABIGuMIGrAgEAAiEAz7neOpIsZ9rBeevPmuZGzkF6DVd+Bcu0sB6wQQGSJw8CAwEAAQIgBqWK39LnitcsE6ug8/LkVwxprUbTmJGthelcnGpk4oECEQDxBmnsnP3xpVW2vK0ceTjBAhEA3KHSeoVNCYmawX5oraMDzwIRAKdwJTXS+jdc/GauPDSDogECEQC3G9pqcu1PyBNXGUlZKlzDAhASO74AOK6q8tA21NMvWu5a";

  static async hayUsuario() {
    try {
      await MiSeguridad.diferidoFirebase;
      return true;
    } catch (err) {
      return false;
    }
  }

  static async obligarLogin() {
    const hay = await MiSeguridad.hayUsuario();
    if (!hay) {
      MiSeguridad.showLogin();
    } else {
      const metadatos = await MiSeguridad.diferidoDatos;
      return metadatos;
    }
  }

  static async buscarUsuario(forzar) {
    if (forzar) {
      return await MiSeguridad.obligarLogin();
    } else {
      const hay = await MiSeguridad.hayUsuario();
      if (hay) {
        return await MiSeguridad.diferidoDatos;
      }
    }
    return;
  }

  static salir = async function () {
    const acepto = await ModuloModales.confirm({});
    console.log(acepto);
    if (!acepto) {
      return;
    }
    const actividad = ModuloActividad.on();
    try {
      await firebase.auth().signOut();
      MiSeguridad.borrarDatos();
      //$.publish('miseguridad.logout');
      location.reload();
    } catch (e) {
      actividad.resolve();
    }
  };

  static recargarDatos(usuario) {
    if (MiSeguridad.diferidoDatos == null) {
      MiSeguridad.diferidoDatos = new Promise((resolve, reject) => {
        MiSeguridad.datosLocales.usr = usuario;
        MiSeguridad.initApp().then(
          () => {
            const actividadIdentidad = ModuloActividad.on();
            const queryParams = ModuloPagina.getCurrentPageValues();
            const url = new URL(`${location.origin}/adm/identidad`);
            url.search = Utilidades.generateQueryParams(queryParams);
            let promesaIdentidad = fetch(url, { method: "GET" });
            promesaIdentidad.catch(() => {
              actividadIdentidad.resolve();
              MiSeguridad.borrarDatos();
              reject(MiSeguridad.datosLocales);
            });
            promesaIdentidad = promesaIdentidad.then((datos) => datos.json());
            promesaIdentidad.then((msg) => {
              Object.assign(MiSeguridad.datosLocales, msg);
              resolve(MiSeguridad.datosLocales);
              actividadIdentidad.resolve();
            });
          },
          () => {
            console.log("Error insertando token");
          }
        );
      });
    }
    return MiSeguridad.diferidoDatos;
  }

  static darToken() {
    return new Promise((resolve, reject) => {
      if (MiSeguridad.diferidoFirebase == null) {
        resolve(null);
      }
      MiSeguridad.diferidoFirebase.then(
        (usr) => {
          if (usr != null && usr != undefined) {
            usr.getIdToken().then(
              function (accessToken) {
                resolve(accessToken);
              },
              function () {
                resolve(null);
              }
            );
          } else {
            reject(null);
          }
        },
        () => {
          reject(null);
        }
      );
    });
  }

  static showLogin() {
    var contenedor = $("#firebaseui-auth-container");
    contenedor.removeClass("invisible");

    if (contenedor.find(".presentacion").length == 0) {
      var quiensoy = $('<div class="presentacion"></div>');
      var titulo = $('meta[name="og:title"]').attr("content");
      var descripcion = $('meta[name="og:description"]').attr("content");
      var urlimagen = $('meta[name="og:background_image"]').attr("content");

      var h1Tit = $("<h1></h1>");
      h1Tit.text(titulo);
      quiensoy.append(h1Tit);

      var pDesc = $("<p></p>");
      pDesc.text(descripcion);
      quiensoy.append(pDesc);

      quiensoy.css({
        "background-image": `url(${urlimagen})`,
      });

      var fondoquiensoy = $('<div class="fondopresentacion"></div>');
      fondoquiensoy.append(quiensoy);

      contenedor.prepend(fondoquiensoy);
    }

    if (contenedor.find(".presentacioncancel").length == 0) {
      var micancelar = $('<div class="presentacioncancel"></div>');
      MiSeguridad.leerTextos().then(function (TEXTOS) {
        micancelar.html(TEXTOS["miseguridad.cancelar"]);
        micancelar.on("click", function () {
          contenedor.addClass("invisible");
        });
        contenedor.append(micancelar);
      });
    }
  }

  static async leerTextos() {
    return {
      "miseguridad.cancelar": "Cancelar",
      "miseguridad.ingresar": "Ingresar",
      "miseguridad.salir": "Salir",
    };
  }

  static borrarDatos() {
    MiSeguridad.datosLocales = {
      id: null,
      usr: null,
      roles: [],
    };
  }

  static modoOffline() {
    var elementoAccion = $("#sign-in");
    var elementoUsuario = $("#firebase_usr_id");
    elementoUsuario.text("");
    MiSeguridad.borrarDatos();
    MiSeguridad.leerTextos().then(function (TEXTOS) {
      elementoAccion.html(TEXTOS["miseguridad.ingresar"]);
      elementoAccion.off("click");
      elementoAccion.on("click", MiSeguridad.showLogin);
    });
  }

  static modoOnline(user) {
    var elementoAccion = $("#sign-in");
    var elementoUsuario = $("#firebase_usr_id");
    var provider = user.providerData[0];
    var texto = provider.displayName + " @ " + provider.providerId;
    elementoUsuario.text(texto);
    MiSeguridad.leerTextos().then(function (TEXTOS) {
      elementoAccion.html(TEXTOS["miseguridad.salir"]);
      elementoAccion.off("click");
      elementoAccion.on("click", MiSeguridad.salir);
    });
  }

  static initApp() {
    if (MiSeguridad.diferidoFirebase != null) {
      return MiSeguridad.diferidoFirebase;
    }
    MiSeguridad.diferidoFirebase = new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(
        function (user) {
          const estadoActualPromise = Utiles.promiseState(
            MiSeguridad.diferidoFirebase
          );
          estadoActualPromise.then((estadoActual) => {
            if (["resolved", "rejected"].indexOf(estadoActual) >= 0) {
              location.reload();
              return;
            }
            if (user !== null) {
              user.getIdToken().then(function (token) {
                resolve(user);
              });
            } else {
              // User is signed out.
              // Initialize the FirebaseUI Widget using Firebase.
              var ui = new firebaseui.auth.AuthUI(firebase.auth());
              // Show the Firebase login button.
              ui.start("#firebaseui-auth-container", MiSeguridad.getUiConfig());
              reject();
            }
          });
        },
        function (error) {
          reject(error);
        }
      );
    });

    MiSeguridad.diferidoFirebase.then(function (user) {
      MiSeguridad.recargarDatos(user).then(function () {
        MiSeguridad.modoOnline(user);
      }, MiSeguridad.modoOffline);
    }, MiSeguridad.modoOffline);

    return MiSeguridad.diferidoFirebase;
  }

  static firebaseConf() {
    if (MiSeguridad.diferidoConf == null) {
      // Puede que lo quiera leer desde algún lugar del back
      const parte2 =
        "eyJsbGF2ZSI6IlNWdFFpeDkvbGRKOVliSmFKTUlDdnE4dzUzTGJRekxHS3VrT1IvMjB2Q289IiwibWVuc2FqZSI6IlUyRnNkR1ZrWDE5YmVyVVhBcE5iYmcyOU5CU2Fjc25mZWVwNExvbWlQREZ6eG9oVnBVeEhUVlBhWmROdDRFbnh4aWtXTEM0ei9uSDhRZzF1cXFzTnlidHNNeGVGdDlEd3pXbHVPWkl6V0JGOVZLK3drbzZaUUFvQlFHR256amw1cDR2WlRHU1RySFNmdXRkdG16TFVMSjVqbjVibVVIbkxCL3U2UkkwWVA2QWttM0QvSW9tOENSRmVya1dEUjVuZU1zemJaMFphTTV2WjdaNzlrZHNuUmxZWTRvYS9qY2xzSEtvVytHRG10TkJSWWNHemYxZCs0WXduUUR4bzZwNEhlWUFUMkM2YzhZbVIyOXk2OVY2TDlPemxkdTRGSkE4U1JwSmlGY3FQcVVrdGl0VTh0USt4STNZaUNUSUZLd2s0dzIzWnhJc1RFTXBMSzBodDN1RGMvRUhJVmh1T3d4eG95UUZpSXJxTU45ZlVRL3F2UFRwOHNJTEVhQ2UzaVpxQ3NQSmlwTU56aW5qNWpYME1ZeWQ3ZmNkTmNsVkl3VERIRFZhTDg3REk0T3gvS2tvVlkxT3RVaGh3aWhiRkZHTmF3QVluMGZMcE82bDRXdkpuSUMzWXB2ZGNqUXJyNGRpOVRZTURUNVplNUdUbmZpZkpXem9TRXZMU0piaG1aajFhIn0=";
      MiSeguridad.diferidoConf = new Promise((resolve, reject) => {
        try {
          const txt = ModuloDatoSeguro.decifrar(parte2, MiSeguridad.PARTE_1);
          const msg = JSON.parse(txt);
          resolve({
            config: msg,
          });
        } catch (e) {
          console.error(e);
          reject(e);
        }
      });
    }
    return MiSeguridad.diferidoConf;
  }

  static inicializar() {
    if (MiSeguridad.diferidoApp == null) {
      MiSeguridad.diferidoApp = new Promise((resolve, reject) => {
        MiSeguridad.firebaseConf().then(
          function (datos) {
            //La configuración
            Object.assign(MiSeguridad.config, datos.config);
            //El cliente
            //Initialize Firebase
            var defaultApp = firebase.initializeApp(MiSeguridad.config);
            resolve({
              app: defaultApp,
              config: MiSeguridad.config,
            });
            MiSeguridad.initApp();
          },
          function (err) {}
        );
      });
    }
    return MiSeguridad.diferidoApp;
  }

  static async thenApp() {
    return MiSeguridad.diferidoApp;
  }

  static getRecaptchaMode() {
    // Quick way of checking query params in the fragment. If we add more config
    // we might want to actually parse the fragment as a query string.
    return location.hash.indexOf("recaptcha=invisible") !== -1
      ? "invisible"
      : "normal";
  }

  static getUiConfig = function () {
    return {
      callbacks: {
        // Called when the user has been successfully signed in.
        signInSuccess: function (user, credential, redirectUrl) {
          MiSeguridad.recargarDatos(user).then(function () {
            //$.publish('miseguridad.login', user);
            location.reload();
          });
          // Do not redirect.
          return false;
        },
      },
      // Opens IDP Providers sign-in flow in a popup.
      signInFlow: "popup",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ,
        {
          provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          scopes: [
            "public_profile",
            "email",
            //'user_likes',
            //'user_friends'
          ],
        },
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          // Whether the display name should be displayed in Sign Up page.
          requireDisplayName: true,
        },
        {
          provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          recaptchaParameters: {
            size: MiSeguridad.getRecaptchaMode(),
          },
          defaultCountry: "CO",
        },
      ],
      tosUrl: "/1/tos/tos.html",
      privacyPolicyUrl: "/1/tos/privacidad.html",
    };
  };
}
