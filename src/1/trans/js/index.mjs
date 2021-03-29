import { ModuloTransformacion } from "../../../js/common/ModuloTransformacion.mjs";
import { ModuloPipeline } from "../../../js/common/Pipeline.mjs";
import { ModuloIntMark } from "../../../js/front/firebase/ModuloIntMark.mjs";
import { ModuloQR } from "../../../js/front/firebase/ModuloQR.mjs";
import { ModuloPubSub } from "../../../js/front/firebase/ModuloPubSub.mjs";

ModuloTransformacion.test("simple");

ModuloPipeline.run("post,prefix,join,post,prefix,source;source").then(function (
  ans
) {
  console.log(JSON.stringify(ans));
});

ModuloIntMark.getDiferidoIntMark({
  useFirebase: true,
  slaveLoged: true,
}).then((datos) => {
  ModuloQR.showQR();
});

ModuloIntMark.afterMaster().then(function () {
  ModuloPubSub.sub("ev", function (msg) {
    console.log("Recibido:" + JSON.stringify(msg));
  });
});

ModuloIntMark.afterSlave().then(function () {
  ModuloPubSub.pub("ev", { txt: "Edgar!" });
});

$(document).ready(function () {
  $("#example1").emojioneArea({
    autoHideFilters: true,
  });
});
