import * as THREE from "../../../node_modules/three/build/three.module.js";
import { GLTFLoader } from "../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "../../../node_modules/three/examples/jsm/loaders/DRACOLoader.js";

import { BasicRender } from "./BasicRender.mjs";
import { Utiles } from "../../common/Utiles.mjs";

export class RenderCreator extends BasicRender {
  models = [];
  constructor(parentContainer, options) {
    super(parentContainer, options);
    this.lastChange = null;
    this.loadModels(options);
  }

  rotateModelsOnScroll() {
    if (this.options.rotateModelsOnScroll) {
      for (let i = 0; i < this.models.length; i++) {
        const model = this.models[i];
        let rotacion = Math.PI * 2 * this.interpolacion;
        model.rotation.y = rotacion;
      }
    }
  }

  rotateCameraOnScroll() {
    if (this.options.rotateCameraOnScroll) {
      this.camera.rotation.y = 6 * Math.PI * this.interpolacion;
    }
  }

  async animate(params) {
    if (this.hasChanged()) {
      this.setNoChanges();
      this.rotateModelsOnScroll();
      this.rotateCameraOnScroll();
      this.getRenderer().render(this.scene, this.camera);
      if (this.controls != null) {
        this.controls.update();
      }
    }
  }

  async loadModels(options) {
    const promesas = [];
    for (let i = 0; i < options.objects.length; i++) {
      promesas.push(this.loadModel(options.objects[i]));
    }
    return Promise.all(promesas);
  }

  async loadModel(options) {
    const descriptor = await Utiles.loadJson(options.url);
    // Instantiate a loader
    const loader = new GLTFLoader();
    const self = this;

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./node_modules/three/examples/js/libs/draco/");
    loader.setDRACOLoader(dracoLoader);

    const objetos = descriptor.objects;

    for (let i = 0; i < objetos.length; i++) {
      const objeto = objetos[i];
      loader.load(
        objeto.url,
        function (gltf) {
          // view-source:https://threejs.org/examples/#webgl_animation_keyframes
          const model = gltf.scene;
          self.models.push(model);
          model.position.set(
            objeto.position[0],
            objeto.position[1],
            objeto.position[2]
          );
          model.scale.set(objeto.scale[0], objeto.scale[1], objeto.scale[2]);

          self.scene.add(model);

          /*
          const mixer = new THREE.AnimationMixer(self.model);
          mixer.clipAction(gltf.animations[0]).play();
          */
        },
        // called while loading is progressing
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        // called when loading has errors
        function (error) {
          console.log("An error happened", error);
        }
      );
    }
  }
}
