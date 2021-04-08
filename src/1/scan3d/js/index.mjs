import { ModuloIntMark } from "../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloQR } from "../../../js/front/firebase/ModuloQR.mjs";
import { Utilidades } from "../../../js/common/Utilidades.mjs";

ModuloIntMark.getDiferidoIntMark({
  useFirebase: false,
  slaveLoged: true,
}).then((datos) => {
  console.log(datos);

  const expected = {
    ans: [
      { k: "archivos.0", v: "{}" },
      { k: "archivos.0.nombre", v: '"hi.gif"' },
      {
        k: "archivos.0.corto",
        v:
          '"/usr/google.com/edgar.jose.fernando.delgado%40gmail.com/5636139285217280/1617905760/hi.gif"',
      },
      { k: "archivos", v: "[]" },
      { k: "archivos.0.type", v: '"application/octet-stream"' },
    ],
    error: 0,
  };

  const obtained = {
    error: 0,
    next:
      "Ck4SSGoWc35wcm95ZWNjaW9uLWNvbG9tYmlhMXIuCxIGUGFnaW5hIhA1NjM2MTM5Mjg1MjE3MjgwDAsSBVR1cGxhGICAgODpmYQKDBgAIAA=",
    ans: [
      { k: "archivos.0", v: "{}" },
      { k: "archivos.0.nombre", v: '"hi.gif"' },
      {
        k: "archivos.0.corto",
        v:
          '"/usr/google.com/edgar.jose.fernando.delgado%40gmail.com/5636139285217280/1617905760/hi.gif"',
      },
    ],
  };
  const nextPage = {
    error: 0,
    ans: [
      { k: "archivos", v: "[]" },
      { k: "archivos.0.type", v: '"application/octet-stream"' },
    ],
  };

  const queryParams = {
    pg: 5636139285217280,
    n: 3,
    next:
      "Ck4SSGoWc35wcm95ZWNjaW9uLWNvbG9tYmlhMXIuCxIGUGFnaW5hIhA1NjM2MTM5Mjg1MjE3MjgwDAsSBVR1cGxhGICAgODpmYQKDBgAIAA=",
  };
  const url = "/api/tup/all/?" + Utilidades.generateQueryParams(queryParams);
  const rta = fetch(url, { method: "GET" }).then((res) => res.json());
  rta.then(function (ans) {
    console.log(ans);
  });

  ModuloQR.showQR();
});
