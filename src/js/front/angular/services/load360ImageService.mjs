import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";

export function load360ImageService() {
  const facePositions = {
    pz: { x: 1, y: 1 },
    nz: { x: 3, y: 1 },
    px: { x: 2, y: 1 },
    nx: { x: 0, y: 1 },
    py: { x: 1, y: 0 },
    ny: { x: 1, y: 2 },
  };
  const mimeType = {
    jpg: "image/jpeg",
    png: "image/png",
  };
  this.get = async (globalOptions = {}) => {
    const settings = Object.assign(
      {
        cubeRotation: 180,
        interpolation: "lanczos",
        format: "jpg",
        size: 200,
        path: "/360cube",
      },
      globalOptions
    );
    const jCanvas = $("<canvas/>", { class: "invisible" });
    const canvas = jCanvas[0];
    const ctx = canvas.getContext("2d");

    $("body").append(jCanvas);

    async function loadImage(file) {
      const promesa = new Promise((resolve, reject) => {
        if (!file) {
          resolve(null);
        }
        const img = new Image();
        img.addEventListener("load", async () => {
          const { width, height } = img;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, width, height);

          const respuesta = await processImage(data);
          resolve(respuesta);
        });
        img.src = URL.createObjectURL(file);
      });
      promesa.then(() => {
        jCanvas.remove();
      });
      return promesa;
    }

    async function processImage(data) {
      const promesas = [];
      for (let [faceName, position] of Object.entries(facePositions)) {
        promesas.push(renderFace(data, faceName, position));
      }
      const total = {};
      const resultado = await Promise.all(promesas);
      for (let i = 0; i < resultado.length; i++) {
        const unResultado = resultado[i];
        total[unResultado.k] = unResultado.v;
      }
      return total;
    }

    async function renderFace(data, faceName) {
      return new Promise((resolve1, reject1) => {
        const options = {
          data: data,
          face: faceName,
          rotation: (Math.PI * settings.cubeRotation) / 180,
          interpolation: settings.interpolation,
        };

        const worker = new Worker("/js/front/workers/convert.js");

        const loadImage = async ({ data: imageData }) => {
          canvas.width = imageData.width;
          canvas.height = imageData.height;
          ctx.putImageData(imageData, 0, 0);

          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(resolve, mimeType[settings.format], 0.95);
          });

          const url = await ModuloArchivos.uploadFile({
            data: blob,
            own: false,
            path: `${settings.path}/${faceName}.${settings.format}`,
          });
          const ans = {};
          ans.k = faceName;
          ans.v = url.pub;
          resolve1(ans);
        };

        worker.onmessage = loadImage;
        worker.postMessage(
          Object.assign({}, options, {
            maxWidth: settings.size,
            interpolation: "linear",
          })
        );
      });
    }

    const file = await ModuloArchivos.askForFile();
    return await loadImage(file);
  };
}
