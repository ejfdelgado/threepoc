import { ModuloIntMark } from "../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloQR } from "../../../js/front/firebase/ModuloQR.mjs";
import { ModuloTupla } from "../../../js/front/page/ModuloTupla.mjs";
import { Cronometro } from "../../../js/common/Cronometro.mjs";

const cronometro = new Cronometro("prueba");
cronometro.tic();

ModuloIntMark.getDiferidoIntMark({
  useFirebase: false,
  slaveLoged: true,
}).then((datos) => {
  console.log(datos);

  const moduloTupla = new ModuloTupla();
  moduloTupla.leer().then(function (rta) {
    cronometro.toc();
    console.log(JSON.stringify(rta, null, 4));

    moduloTupla.guardar({ esto: { es: 4 } });
  });

  ModuloQR.showQR();
});
