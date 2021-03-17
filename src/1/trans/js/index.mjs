import { ModuloTransformacion } from "../../../js/common/ModuloTransformacion.mjs";
import { ModuloPipeline } from "../../../js/common/Pipeline.mjs";

ModuloTransformacion.test("simple");

ModuloPipeline.run("post,prefix,join,post,prefix,source;source").then(function (
  ans
) {
  console.log(JSON.stringify(ans));
});
