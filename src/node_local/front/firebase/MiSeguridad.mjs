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

export class MiSeguridad {
  static diferidoConf = null;
  static diferidoApp = null;
  static config = {};
  static diferidoFirebase = null;
  static datosLocales = {};
  static diferidoDatos = null;

  static salir = function () {
    //var actividad = moduloActividad.on();
    var promesa = firebase.auth().signOut();
    promesa.then(
      function () {
        MiSeguridad.borrarDatos();
        //$.publish('miseguridad.logout');
        location.reload();
      },
      function (error) {
        //actividad.resolve();
      }
    );
    return promesa;
  };

  static recargarDatos(usuario) {
    if (MiSeguridad.diferidoDatos == null) {
      MiSeguridad.diferidoDatos = new Promise((resolve, reject) => {
        MiSeguridad.datosLocales.usr = usuario;
        const peticion = {
          method: "GET",
        };
        MiSeguridad.insertarToken(peticion).then(
          (peticion) => {
            fetch("/adm/identidad", peticion).then(
              (response) => {
                response.json().then((msg) => {
                  Object.assign(MiSeguridad.datosLocales, msg);
                  resolve(MiSeguridad.datosLocales);
                });
              },
              () => {
                MiSeguridad.borrarDatos();
                reject(datosLocales);
              }
            );
          },
          () => {
            console.log("Error insertando token");
          }
        );
      });
    }
    return MiSeguridad.diferidoDatos;
  }

  static insertarToken(peticion) {
    return new Promise((resolve, reject) => {
      MiSeguridad.darToken().then(
        (accessToken) => {
          if (accessToken != null) {
            if (!("headers" in peticion)) {
              peticion.headers = {};
            }
            peticion.headers["Authorization"] = "Bearer " + accessToken;
            resolve(peticion);
          } else {
            reject(peticion);
          }
        },
        () => {
          reject(peticion);
        }
      );
    });
  }

  static darToken() {
    return new Promise((resolve, reject) => {
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
      var urlimagen = $('meta[name="og:image"]').attr("content");

      var h1Tit = $("<h1></h1>");
      h1Tit.text(titulo);
      quiensoy.append(h1Tit);

      var pDesc = $("<p></p>");
      pDesc.text(descripcion);
      quiensoy.append(pDesc);

      /*
        var myImg = $('<img/>');
        myImg.attr('src', urlimagen);
        quiensoy.append(myImg);
        */

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
  }

  static firebaseConf() {
    if (MiSeguridad.diferidoConf == null) {
      // Puede que lo quiera leer desde algún lugar del back
      MiSeguridad.diferidoConf = new Promise((resolve, reject) => {
        resolve({
          config: FIREBASE_CONFIG,
        });
      });
    }
    return MiSeguridad.diferidoConf;
  }

  static inicializar() {
    if (MiSeguridad.diferidoApp == null) {
      MiSeguridad.diferidoApp = new Promise((resolve, reject) => {
        MiSeguridad.firebaseConf().then(function (datos) {
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
        });
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
