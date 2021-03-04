const THREE = require('three/build/three.module');
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

import { RendererGlobal } from "./RendererGlobal";

export class BasicRender {
  renderer: any;
  scene: any;
  camera: any;
  parentContainer: any = null;
  bbox: any = null;
  interpolacion: number = 0;
  visible: boolean = null;
  controls: any = null;
  sourceJson: string;
  constructor(parentContainer: any) {
    this.parentContainer = parentContainer;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      40, //fov — Camera frustum vertical field of view, in degrees. Default is 50.
      window.innerWidth / window.innerHeight,
      1,//near — Camera frustum near plane, Default is 0.1.
      100 //far — Camera frustum far plane. Default is 2000.
    );
    this.camera.position.set(5, 2, 8);
    this.scene.background = new THREE.Color(0xbfe3dd);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 2, 8);
    this.scene.add(dirLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.sourceJson = this.parentContainer.attr("data-3d-scene");
    this.parentContainer.append(this.renderer.domElement);

    if (true) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 0.5, 0);
      this.controls.update();
      this.controls.enablePan = false;
      this.controls.enableDamping = true;
      this.controls.enableZoom = false;
    } else {
      this.controls = new TrackballControls(
        this.camera,
        this.renderer.domElement
      );
      this.controls.noZoom = true;
    }

    RendererGlobal.renders.push(this);
  }

  async resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  async computeBoundingBox(myparams: any) {
    if (this.parentContainer != null) {
      this.bbox = this.parentContainer[0].getBoundingClientRect();
      const diff1 = this.bbox.height - this.bbox.top;
      this.interpolacion = diff1 / (myparams.vh + this.bbox.height);
      this.visible = this.interpolacion > 0 && this.interpolacion < 1;
    }
  }

  async superAnimate(myParams: any) {
    if (myParams.self.visible) {
      await myParams.self.animate();
    }
  }

  protected getRenderer() {
    return this.renderer;
  }
}
