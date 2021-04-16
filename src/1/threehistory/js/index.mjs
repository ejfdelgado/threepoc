import { RendererGlobal } from "../../../js/front/three/RendererGlobal.mjs"
import { RenderCreator } from "../../../js/front/three/RenderCreator.mjs"
import { Utiles } from "../../../js/common/Utiles.mjs"

export class App {
    static recreate() {
        console.log(Utiles.getCurrentTimeNumber());
        $("[data-3d-scene]").each(function() {
            new RenderCreator($(this));
        });
        RendererGlobal.fullAnimate();
        window.addEventListener( 'resize', RendererGlobal.configureResize, false );
        window.addEventListener('scroll', RendererGlobal.updateBBox );
    }
}

App.recreate();
