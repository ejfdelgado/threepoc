import { ModuloTransformacion } from "../../../js/common/ModuloTransformacion.mjs";
import { ModuloPipeline } from "../../../js/common/Pipeline.mjs";
import { ModuloIntMark } from "../../../js/front/firebase/ModuloIntMark.mjs";

ModuloTransformacion.test("simple");

ModuloPipeline.run("post,prefix,join,post,prefix,source;source").then(function (
  ans
) {
  console.log(JSON.stringify(ans));
});

ModuloIntMark.getDiferidoIntMark({});

fetch("/a/", {
  method: "POST",
  body: JSON.stringify({
    theurl:
      "http://proyeccion-colombia1.appspot.com/1/scan3d#!/?pg=5732110983757824&sl=si&add",
  }),
  headers: { "Content-Type": "application/json" },
})
  .then((res) => res.json())
  .then((json) => console.log(json));
