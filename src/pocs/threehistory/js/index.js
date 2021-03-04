import { RendererGlobal } from "../../../three/RendererGlobal.js"
import { RenderCreator } from "../../../three/RenderCreator.js"

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