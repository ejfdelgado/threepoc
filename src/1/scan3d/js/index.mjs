import { ModuloIntMark } from "../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloQR } from "../../../js/front/firebase/ModuloQR.mjs";
import { ModuloTupla } from "../../../js/front/page/ModuloTupla.mjs";

ModuloIntMark.getDiferidoIntMark({
  useFirebase: false,
  slaveLoged: true,
}).then((datos) => {
  console.log(datos);

  const moduloTupla = new ModuloTupla();
  moduloTupla.leer().then(function (rta) {
    console.log(JSON.stringify(rta, null, 4));
  });

  ModuloQR.showQR();
});
