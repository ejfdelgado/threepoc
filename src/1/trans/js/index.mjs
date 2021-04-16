import { ModuloTransformacion } from "/js/common/ModuloTransformacion.mjs";
import { ModuloPipeline } from "/js/common/Pipeline.mjs";
import { ModuloIntMark } from "/js/front/firebase/ModuloIntMark.mjs";
import { ModuloQR } from "/js/front/firebase/ModuloQR.mjs";
import { ModuloPubSub } from "/js/front/firebase/ModuloPubSub.mjs";
import { ModuloArchivos } from "/js/common/ModuloArchivos.mjs";

ModuloPipeline.run("post,prefix,join,post,prefix,source;source").then(function (
  ans
) {
  console.log(JSON.stringify(ans));
});

ModuloIntMark.getDiferidoIntMark({
  useFirebase: true,
  slaveLoged: true,
}).then((datos) => {
  $("#upload").on("click", function () {
    const example = {
      simple: "archivo.jpg",
      key: "public/usr/anonymous/1/trans/pg/5690145009303552/archivo.jpg",
      local:
        "http://proyeccion-colombia1.appspot.com/storage/read?name=public/usr/anonymous/1/trans/pg/5690145009303552/archivo.jpg",
      pub:
        "https://storage.googleapis.com/proyeccion-colombia1.appspot.com/public/usr/anonymous/1/trans/pg/5690145009303552/archivo.jpg?t=1617155281635",
    };
    ModuloArchivos.uploadFile({
      //path: "mio/${YYYY}${MM}${dd}_${HH}${mm}${ss}.txt",
      path: "mio/${name}",
      own: false,
      tipos: ["text/plain"],
      maximoTamanio: 1024 * 1024,
    }).then(function () {});
  });

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
