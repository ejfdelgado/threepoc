import * as THREE from "../../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { TrackballControls } from "../../../node_modules/three/examples/jsm/controls/TrackballControls.js";

import { RendererGlobal } from "./RendererGlobal.mjs";

export class BasicRender {
  renderer;
  scene;
  camera;
  parentContainer = null;
  bbox = null;
  interpolacion = 0;
  visible = null;
  controls = null;
  sourceJson;
  constructor(parentContainer) {
    this.parentContainer = parentContainer;
    this.localChanges = 0;
    this.scene = new THREE.Scene();
    const ahora = new Date().getTime();
    this.scene.background = new THREE.CubeTextureLoader()
      .setPath(
        "https://storage.googleapis.com/proyeccion-colombia1.appspot.com/public/usr/anonymous/1/html/cv/pg/5677287789821952/360cube/"
      )
      .load(
        [
          "px.jpg?t=" + ahora,
          "nx.jpg?t=" + ahora,
          "py.jpg?t=" + ahora,
          "ny.jpg?t=" + ahora,
          "pz.jpg?t=" + ahora,
          "nz.jpg?t=" + ahora,
        ],
        () => {
          this.setChanged();
        }
      );

    this.camera = new THREE.PerspectiveCamera(
      40, //fov — Camera frustum vertical field of view, in degrees. Default is 50.
      window.innerWidth / window.innerHeight,
      1, //near — Camera frustum near plane, Default is 0.1.
      100 //far — Camera frustum far plane. Default is 2000.
    );
    this.camera.position.set(5, 2, 8);
    // this.scene.background = new THREE.Color(0xbfe3dd);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 2, 8);
    this.scene.add(dirLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.sourceJson = this.parentContainer.attr("data3d-scene");
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
    this.controls.addEventListener("change", () => {
      this.setChanged();
    });

    RendererGlobal.renders.push(this);
  }

  setChanged() {
    this.localChanges++;
  }

  async resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  async computeBoundingBox(myparams) {
    if (this.parentContainer != null) {
      this.bbox = this.parentContainer[0].getBoundingClientRect();
      const diff1 = this.bbox.height - this.bbox.top;
      this.interpolacion = diff1 / (myparams.vh + this.bbox.height);
      this.visible = this.interpolacion > 0 && this.interpolacion < 1;
    }
  }

  async superAnimate(myParams) {
    if (myParams.self.visible) {
      await myParams.self.animate();
    }
  }

  getRenderer() {
    return this.renderer;
  }
}
