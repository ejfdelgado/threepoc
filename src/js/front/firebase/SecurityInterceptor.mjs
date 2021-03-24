import { Utiles } from "../../common/Utiles.mjs";
import { MiSeguridad } from "./MiSeguridad.mjs";
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
          args = await listaLocal[i].request(...args);
        }
        var result = await originalFetch(...args);
        return result;
      })(args);
    SecurityInterceptor.initialized = true;
  }

  static register() {
    SecurityInterceptor.initialize();
    SecurityInterceptor.registerReferer();
    SecurityInterceptor.registerAuthToken();
  }

  static unregister() {
    while (SecurityInterceptor.list.length > 0) {
      const funcion = SecurityInterceptor.list.splice(0, 1);
      funcion();
    }
  }

  static registerAuthToken() {
    SecurityInterceptor.list.push({
      request: async (url, config) => {
        if ([null, undefined].indexOf(config.headers) >= 0) {
          config.headers = {};
        }
        const accessToken = await MiSeguridad.darToken();
        if (accessToken != null) {
          config.headers["Authorization"] = "Bearer " + accessToken;
        }
        return [url, config];
      },
    });
  }

  static registerReferer() {
    SecurityInterceptor.list.push({
      request: async (url, config) => {
        if ([null, undefined].indexOf(config.headers) >= 0) {
          config.headers = {};
        }
        config.referrer = Utiles.getReferer();
        config.headers["HTTP_REFERER"] = Utiles.getReferer();
        return [url, config];
      },
    });
  }
}
