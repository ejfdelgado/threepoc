import { RendererGlobal } from "./RendererGlobal.js"
import { RenderCreator } from "./RenderCreator.js"

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