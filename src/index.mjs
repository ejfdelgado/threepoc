import { RendererGlobal } from "./RendererGlobal.mjs"
import { RenderCreator } from "./RenderCreator.mjs"

export class App {
    static recreate() {
        $("[data-3d-scene]").each(function() {
            new RenderCreator($(this));
        });
        RendererGlobal.fullAnimate();
        window.addEventListener( 'resize', RendererGlobal.configureResize, false );
        window.addEventListener('scroll', RendererGlobal.updateBBox );
    }
}

App.recreate();