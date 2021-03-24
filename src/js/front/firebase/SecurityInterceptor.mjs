import { Utiles } from "../../common/Utiles.mjs";
const originalFetch = window.fetch;

export class SecurityInterceptor {
  static list = [];
  static initialized = false;

  static initialize() {
    if (SecurityInterceptor.initialized) {
      return;
    }
    window.fetch = (...args) =>
      (async (args) => {
        const listaLocal = SecurityInterceptor.list;
        for (let i = 0; i < listaLocal.length; i++) {
          args = listaLocal[i].request(...args);
        }
        var result = await originalFetch(...args);
        return result;
      })(args);
    SecurityInterceptor.initialized = true;
  }

  static register() {
    SecurityInterceptor.initialize();
    SecurityInterceptor.registerReferer();
  }

  static unregister() {
    while (SecurityInterceptor.list.length > 0) {
      const funcion = SecurityInterceptor.list.splice(0, 1);
      funcion();
    }
  }

  static registerReferer() {
    SecurityInterceptor.list.push({
      request: function (url, config) {
        if ([null, undefined].indexOf(config.headers) >= 0) {
          config.headers = {};
        }
        config.referrer = Utiles.getReferer();
        config.headers["HTTP_REFERER"] = Utiles.getReferer();
        return [url, config];
      },

      requestError: function (error) {
        // Called when an error occured during another 'request' interceptor call
        return Promise.reject(error);
      },

      response: function (response) {
        // Modify the reponse object
        return response;
      },

      responseError: function (error) {
        // Handle an fetch error
        return Promise.reject(error);
      },
    });
  }
}
