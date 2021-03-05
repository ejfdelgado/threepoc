import * as THREE from '../../../node_modules/three/build/three.module.js';
import { GLTFLoader } from "../../../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "../../../node_modules/three/examples/jsm/loaders/DRACOLoader.js";

import { BasicRender } from "./BasicRender.mjs";
import { Utiles } from "../common/Utiles.mjs";

export class RenderCreator extends BasicRender {
  models = [];
  constructor(parentContainer) {
    super(parentContainer);
    this.camera.position.z = 5;
    this.loadModel();
  }

  async animate() {
    for (let i=0; i<this.models.length; i++) {
      const model = this.models[i];
      let rotacion = Math.PI * 2 * this.interpolacion;
      model.rotation.y = rotacion;
    }
    this.getRenderer().render(this.scene, this.camera);
    this.controls.update();
  }

  async loadModel() {
    const descriptor = (
      await Utiles.loadJson(this.sourceJson)
    );
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
          model.position.set(objeto.position[0], objeto.position[1], objeto.position[2]);
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
