import * as THREE from "../../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { TrackballControls } from "../../../node_modules/three/examples/jsm/controls/TrackballControls.js";

import { RendererGlobal } from "./RendererGlobal.mjs";

const CAMERA_DEFAULT = {
  fov: 40, // Camera frustum vertical field of view, in degrees, Default is 50
  near: 1, // Camera frustum near plane, Default is 0.1.
  far: 100, // Camera frustum far plane. Default is 2000.
};
const SIZE_DEFAULT = {
  w: "100vw",
  h: "100vh",
};

export class BasicRender {
  renderer;
  scene;
  camera;
  parentContainer = null;
  bbox = null;
  interpolacion = 0;
  visible = null;
  controls = null;
  constructor(parentContainer, options) {
    this.options = options;
    this.parentContainer = parentContainer;
    this.lastLocalChanges = null;
    this.localChanges = 0;
    this.scene = new THREE.Scene();
    this.loadBackground(options);

    options.camera = Object.assign(
      JSON.parse(JSON.stringify(CAMERA_DEFAULT)),
      options.camera
    );
    options.size = Object.assign(
      JSON.parse(JSON.stringify(SIZE_DEFAULT)),
      options.size
    );

    this.camera = new THREE.PerspectiveCamera(
      options.camera.fov,
      window.innerWidth / window.innerHeight,
      options.camera.near,
      options.camera.far
    );
    this.initializeCamera(options);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 2, 8);
    this.scene.add(dirLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.resize();
    this.parentContainer.append(this.renderer.domElement);

    if (options.control == "orbit") {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 0.5, 0);
      this.controls.update();
      this.controls.enablePan = false;
      this.controls.enableDamping = true;
      this.controls.enableZoom = false;
    } else if (options.control == "trackball") {
      this.controls = new TrackballControls(
        this.camera,
        this.renderer.domElement
      );
      this.controls.noZoom = true;
    }
    if (this.controls !== null) {
      this.controls.addEventListener("change", () => {
        this.setChanged();
      });
    }

    RendererGlobal.renders.push(this);
  }

  initializeCamera(options) {
    const cameraPosition = options.camera.position;
    if (cameraPosition instanceof Array) {
      this.camera.position.set(
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2]
      );
    }
  }

  loadBackground(options) {
    const ahora = new Date().getTime();
    if (typeof options.background.url == "string") {
      this.scene.background = new THREE.CubeTextureLoader()
        .setPath(options.background.url)
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
    } else if (typeof options.background.rgb == "number") {
      this.scene.background = new THREE.Color(options.background.rgb);
    }
  }

  setChanged() {
    this.localChanges++;
  }

  hasChanged() {
    return this.lastLocalChanges != this.localChanges;
  }

  setNoChanges() {
    this.lastLocalChanges = this.localChanges;
  }

  decodeSize(tam, elemsize) {
    let partes = /(\d+)(%|vw|vh|)/.exec(tam);
    if (partes != null) {
      const numero = parseInt(partes[1]);
      if (partes[2] == "%") {
        return (numero * elemsize) / 100;
      } else if (partes[2] == "vw") {
        return (numero * window.innerWidth) / 100;
      } else if (partes[2] == "vh") {
        return (numero * window.innerHeight) / 100;
      } else if (partes[2] == "") {
        return numero;
      }
    }
  }

  async resize() {
    const parent = $(this.parentContainer);
    const elemw = parent.width();
    const elemh = parent.height();
    const w = this.decodeSize(this.options.size.w, elemw);
    const h = this.decodeSize(this.options.size.h, elemh);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
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
