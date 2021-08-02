export class RendererGlobal {
  static renders = [];
  constructor() {}

  static initialize() {
    const temp = RendererGlobal.generateParamsBBox({});
    RendererGlobal.vw = temp.vw;
    RendererGlobal.vh = temp.vh;

    RendererGlobal.fullAnimate();
    window.addEventListener("resize", RendererGlobal.configureResize, false);
    window.addEventListener("scroll", RendererGlobal.updateBBox);
    const document = $("body");
    const estado = {
      drag: false,
      x0: null,
      y0: null,
      xd: null,
      yd: null,
    };

    function getCoordinates(event) {
      if (["touchmove", "touchstart"].indexOf(event.type) >= 0) {
        return {
          x: event.originalEvent.touches[0].screenX,
          y: event.originalEvent.touches[0].screenY,
        };
      } else {
        return {
          x: event.screenX,
          y: event.screenY,
        };
      }
    }

    document.on("touchstart mousedown", (e) => {
      estado.drag = true;
      const coord = getCoordinates(e);
      estado.x0 = coord.x;
      estado.y0 = coord.y;
    });

    document.on("touchend mouseup mouseleave", (e) => {
      estado.drag = false;
    });

    document.on("touchmove mousemove", (e) => {
      if (estado.drag) {
        const coord = getCoordinates(e);
        estado.xd = coord.x - estado.x0;
        estado.yd = coord.y - estado.y0;
        estado.x0 = coord.x;
        estado.y0 = coord.y;
        estado.vw = RendererGlobal.vw;
        estado.vh = RendererGlobal.vh;
        RendererGlobal.iterateRenders(["globalDrag", "setChanged"], estado);
      }
    });
  }

  static configureResize() {
    RendererGlobal.iterateRenders("setChanged");
    RendererGlobal.iterateRenders("resize");
  }

  static generateParamsBBox(e) {
    return {
      event: e,
      vw: Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      ),
      vh: Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      ),
    };
  }

  static updateBBox(e) {
    const temp = RendererGlobal.generateParamsBBox(e);
    RendererGlobal.vw = temp.vw;
    RendererGlobal.vh = temp.vh;
    RendererGlobal.iterateRenders("setChanged");
    RendererGlobal.iterateRenders("computeBoundingBox", temp);
  }

  static fullAnimate() {
    RendererGlobal.iterateRenders(["autoload", "animate"], {
      ifVisible: true,
    }).then(function () {
      requestAnimationFrame(RendererGlobal.fullAnimate);
    });
  }

  static iterateRenders(callbackName, myParams = {}) {
    let listCallbackName = callbackName;
    if (!(listCallbackName instanceof Array)) {
      listCallbackName = [listCallbackName];
    }
    const lista = RendererGlobal.renders;
    const promesas = [];
    for (let i = 0; i < lista.length; i++) {
      const someAnimate = lista[i];
      if (myParams.ifVisible === true) {
        if (someAnimate.visible == null) {
          //Se debe calcular si es visible o no
          someAnimate.computeBoundingBox(
            RendererGlobal.generateParamsBBox(null)
          );
        }
        if (someAnimate.visible) {
          for (let j = 0; j < listCallbackName.length; j++) {
            promesas.push(someAnimate[listCallbackName[j]](myParams));
          }
        }
      } else {
        for (let j = 0; j < listCallbackName.length; j++) {
          promesas.push(someAnimate[listCallbackName[j]](myParams));
        }
      }
    }
    return Promise.all(promesas);
  }
}
