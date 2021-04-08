import { ModuloIntMark } from "../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloQR } from "../../../js/front/firebase/ModuloQR.mjs";


ModuloIntMark.getDiferidoIntMark({
  useFirebase: false,
  slaveLoged: true,
}).then((datos) => {
  

  ModuloQR.showQR();
});
