import { RendererGlobal } from "../../../node_local/three/RendererGlobal.mjs"
import { RenderCreator } from "../../../node_local/three/RenderCreator.mjs"
import { Utiles } from "../../../node_local/common/Utiles.mjs"

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