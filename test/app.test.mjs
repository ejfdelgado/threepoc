import request from "supertest";
import app from "../app.mjs";
import assert from "assert";
import { ModuloTransformacion } from "../src/js/common/ModuloTransformacion.mjs";
import jsonSortify from "../node_modules/json.sortify/dist/JSON.sortify.js";

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
            subobjeto: { a: 4, b: 6 },
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
            valor: 5,
            arreglo: ["a", "b", "c"],
            subobjeto: { a: 4, b: 6 },
          },
        },
      ];
      const opciones = {
        keysNoBreak: [""],
      };
      test_transformacion("simple", pool, done, opciones);
    });
  });
});
