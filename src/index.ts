import { RendererGlobal } from "./RendererGlobal"
import { RenderCreator } from "./RenderCreator"

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