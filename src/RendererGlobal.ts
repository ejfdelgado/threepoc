import { BasicRender } from "./BasicRender";
import { RenderCreator } from "./RenderCreator";

export interface RenderParams {
    ifVisible?: boolean,
    event?: any,
    vw?: number,
    vh?: number
}

export class RendererGlobal {
    static renders : any[] = [];
    constructor() {

    }

    static configureResize() {
        RendererGlobal.iterateRenders("resize");
    }

    static generateParamsBBox(e : any) {
        return {
            event: e, 
            vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0), 
            vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        };
    }

    static updateBBox(e : any) {
        RendererGlobal.iterateRenders("computeBoundingBox", RendererGlobal.generateParamsBBox(e));
    }

    static fullAnimate() {
        RendererGlobal.iterateRenders("animate", {ifVisible: true}).then(function() {
            requestAnimationFrame(RendererGlobal.fullAnimate);
        });
    }

    static iterateRenders(callbackName : string, myParams : RenderParams = {}) {
        const lista = RendererGlobal.renders;
        const promesas = [];
        for (let i=0; i<lista.length; i++) {
            const someAnimate = lista[i];
            if (myParams.ifVisible === true) {
                if (someAnimate.visible == null) {
                    //Se debe calcular si es visible o no
                    someAnimate.computeBoundingBox(RendererGlobal.generateParamsBBox(null));
                }
                if (someAnimate.visible) {
                    promesas.push(someAnimate[callbackName](myParams));
                }
            } else {
                promesas.push(someAnimate[callbackName](myParams));
            }
        }
        return Promise.all(promesas);
    }
};