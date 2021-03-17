export class PipelineNode {
  static async lookFor() {
    return null;
  }
  static async postProcess(data) {
    return data;
  }
}

export class SourceNode extends PipelineNode {
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  static async lookFor() {
    await SourceNode.sleep(100 + parseInt(100 * Math.random()));
    return new Date().getTime();
  }
}

export class JoinNode extends PipelineNode {
  static async postProcess(data) {
    let total = "";
    for (let i = 0; i < data.length; i++) {
      const elem = data[i];
      total += elem + "-";
    }
    while (data.length > 1) {
      data.splice(0, 1);
    }
    data[0] = total.replace(/[-]$/, "");
    return;
  }
}

export class IncNode extends PipelineNode {
  static async postProcess(data) {
    for (let i = 0; i < data.length; i++) {
      const elem = data[i];
      data[i] = elem + "-post";
    }
    return;
  }
}

export class PrefixNode extends PipelineNode {
  static async postProcess(data) {
    for (let i = 0; i < data.length; i++) {
      const elem = data[i];
      data[i] = "pre-" + elem;
    }
    return;
  }
}

export class ModuloPipeline {
  static registry = {};
  static register(key, nodeClass) {
    ModuloPipeline.registry[key] = nodeClass;
  }

  static async lookFor(
    pipeline,
    functionName = "lookFor",
    respuestas = [],
    forward = true
  ) {
    //Se hace el recorido hacia adelante
    const patron = /[^,]+/g;
    let match;
    let stepBack = "";
    do {
      match = patron.exec(pipeline);
      if (match) {
        const stepName = match[0];
        const patron2 = /[^;]+/g;
        const paralelo = [];
        let match2;
        do {
          match2 = patron2.exec(stepName);
          if (match2) {
            const stepName2 = match2[0];
            const claseReal = ModuloPipeline.registry[stepName2];
            if (claseReal != undefined) {
              const funcionReal = claseReal[functionName];
              paralelo.push(funcionReal(respuestas));
            }
          }
        } while (match2);

        if (forward) {
          respuestas = await Promise.all(paralelo);
          respuestas = respuestas.filter(function (valor) {
            return valor != null && valor != undefined;
          });
          if (respuestas.length > 0) {
            return {
              responses: respuestas,
              stepBack: stepBack.replace(/^[,]|[,]$/, ""),
            };
          }
        } else {
          await Promise.all(paralelo);
        }
        stepBack = stepName + "," + stepBack;
      }
    } while (match);
    return {
      responses: respuestas,
    };
  }

  /**
   * Procesa un pipeline
   * @param pipeline texto separado por comas (serial) o punto y coma (paralelo)
   */
  static async run(pipeline) {
    //1. Se busca si alguien encuentra algo...
    const respuestaLookFor = await ModuloPipeline.lookFor(pipeline);
    console.log(JSON.stringify(respuestaLookFor));
    if (respuestaLookFor.responses.length > 0) {
      const respuestaPostProcess = await ModuloPipeline.lookFor(
        respuestaLookFor.stepBack,
        "postProcess",
        respuestaLookFor.responses,
        false
      );
      return respuestaPostProcess.responses;
    }
    return null;
  }
}

ModuloPipeline.register("source", SourceNode);
ModuloPipeline.register("post", IncNode);
ModuloPipeline.register("prefix", PrefixNode);
ModuloPipeline.register("join", JoinNode);
