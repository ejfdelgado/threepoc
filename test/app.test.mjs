import request from "supertest";
import app from "../app.mjs";
import assert from "assert";
import { ModuloTransformacion } from "../src/js/common/ModuloTransformacion.mjs";
import jsonSortify from "../node_modules/json.sortify/dist/JSON.sortify.js";
import { Amortiguar } from "../src/js/common/Amortiguar.mjs";
import { Utiles } from "../src/js/common/Utiles.mjs";

describe("tokenizar", () => {
  it("tokenizar ok", function (done) {
    const partes = Utiles.getSearchables(
      "América tiene árboles de color azúl, yo sí se",
      3
    );
    const esperado = [
      "ame",
      "amer",
      "ameri",
      "americ",
      "america",
      "tie",
      "tien",
      "tiene",
      "arb",
      "arbo",
      "arbol",
      "arbole",
      "arboles",
      "col",
      "colo",
      "color",
      "azu",
      "azul",
    ];
    for (let i = 0; i < esperado.length; i++) {
      assert.equal(esperado[i], partes[i]);
    }
    done();
  });
});

describe("gae_node_request_example", () => {
  describe("GET /api/tup/fecha", () => {
    it("should get 200", (done) => {
      request(app).get("/api/utiles/").expect(200, done);
    });
  });
});

const test_transformacion = function (tipo, pool, done, opciones) {
  const serializador = ModuloTransformacion.modo(tipo);
  for (let i = 0; i < pool.length; i++) {
    const objetoPrueba = pool[i];
    const serializado = serializador.to(objetoPrueba, true, true, opciones);
    console.log("Dato de prueba:", objetoPrueba);
    console.log("Dato serializado:", JSON.stringify(serializado, null, 4));
    const deserializado = serializador.from(serializado, true);
    const texto1 = jsonSortify(objetoPrueba);
    const texto2 = jsonSortify(deserializado);
    assert.equal(texto1, texto2);
  }
  done();
};

describe("amortiguar", () => {
  it("basico", function () {
    //this.timeout(500);
    const promesa = new Promise((resolve, reject) => {
      const amortiguar = new Amortiguar(200);
      setTimeout(() => {
        console.log("Pidiendo permiso otra vez...");
        amortiguar.darPermiso("guardar").then(() => {
          resolve();
        });
      }, 100);
      amortiguar.darPermiso("guardar").then(() => {
        reject();
      });
    });
    return promesa;
  });
});

describe("transformacion_aplanamiento", () => {
  describe("simple", () => {
    it("sencillo", (done) => {
      const pool = [
        { nombre: { valor: 5, arreglo: ["a"] } },
        [1, 5, 7, 8],
        { a: 5 },
        [{ e: "texto" }],
        { nombre: true },
        [true, "hey!", 4],
      ];
      test_transformacion("simple", pool, done);
    });
    it("serializando objetos", (done) => {
      const pool = [
        {
          nombre: {
            valor: 5,
            arreglo: ["a", "b", "c"],
            subobjeto: { a: 4, b: 6, p: [1, 2, 3] },
          },
        },
      ];
      const opciones = {
        keysNoBreak: ["^nombre\\.arreglo", "^nombre\\.subobjeto"],
      };
      test_transformacion("simple", pool, done, opciones);
    });
    it("serializando todo el objeto", (done) => {
      const pool = [
        {
          nombre: {
            roles: ["a", "b", "c"],
            subobjeto: { a: 4, b: 6 },
          },
          edgar: {
            otro: [1, 2, 3],
          },
        },
      ];
      const opciones = {
        keysNoBreak: ["^[^.]+\\.[^.]+"],
      };
      test_transformacion("simple", pool, done, opciones);
    });
    it("raiz al usar subdominio", (done) => {
      const pool = [
        {
          "Z29vZ2xlLmNvbS9kcm1hcnRpbm4yNUBnbWFpbC5jb20=": {
            roles: [{ v: "reader" }, { v: "writer" }],
          },
          Z29vZ2xlLmNvbS9lZGdhci5qb3NlLmZlcm5hbmRvLmRlbGdhZG9AZ21haWwuY29t: {
            roles: [{ v: "reader" }],
          },
        },
      ];
      const opciones = {
        keysNoBreak: ["^[^.]+\\.[^.]+"],
        includeBase: true,
      };

      test_transformacion("simple", pool, done, opciones);
    });
  });
});
