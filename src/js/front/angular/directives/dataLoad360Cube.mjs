import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";

class CubeFace {
  constructor(faceName) {
    this.faceName = faceName;

    this.anchor = document.createElement("a");
    this.anchor.style.position = "absolute";
    this.anchor.title = faceName;

    this.img = document.createElement("img");
    this.img.style.filter = "blur(4px)";

    this.anchor.appendChild(this.img);
  }

  setPreview(url, x, y) {
    this.img.src = url;
    this.anchor.style.left = `${x}px`;
    this.anchor.style.top = `${y}px`;
  }

  setDownload(url, fileExtension) {
    this.anchor.href = url;
    this.anchor.download = `${this.faceName}.${fileExtension}`;
    this.img.style.filter = "";
  }
}

export const dataLoad360Cube = [
  "$compile",
  function ($compile) {
    return {
      restrict: "A",
      scope: {},
      link: function (scope, element, attrs) {
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
        const settings = {
          cubeRotation: 180,
          interpolation: "lanczos",
          format: "jpg",
        };
        const jCanvas = $("<canvas/>", { class: "invisible" });
        const jOutput = $("<output/>", { class: "invisible" });
        const jEl = $(element);
        const canvas = jCanvas[0];
        const ctx = canvas.getContext("2d");
        let finished = 0;
        let workers = [];
        const dom = {
          faces: jOutput[0],
        };

        jEl.append(jCanvas);
        jEl.append(jOutput);

        function getDataURL(imgData, extension) {
          canvas.width = imgData.width;
          canvas.height = imgData.height;
          ctx.putImageData(imgData, 0, 0);
          return new Promise((resolve) => {
            canvas.toBlob(
              (blob) => resolve(URL.createObjectURL(blob)),
              mimeType[extension],
              0.92
            );
          });
        }

        function loadImage(file) {
          if (!file) {
            return;
          }

          const img = new Image();

          img.src = URL.createObjectURL(file);

          img.addEventListener("load", () => {
            const { width, height } = img;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, width, height);

            processImage(data);
          });
        }

        function removeChildren(node) {
          while (node.firstChild) {
            node.removeChild(node.firstChild);
          }
        }

        function processImage(data) {
          removeChildren(dom.faces);

          // Termina los workers anteriores
          for (let worker of workers) {
            worker.terminate();
          }

          for (let [faceName, position] of Object.entries(facePositions)) {
            renderFace(data, faceName, position);
          }
        }

        function renderFace(data, faceName, position) {
          const face = new CubeFace(faceName);
          dom.faces.appendChild(face.anchor);

          const options = {
            data: data,
            face: faceName,
            rotation: (Math.PI * settings.cubeRotation) / 180,
            interpolation: settings.interpolation,
          };

          const worker = new Worker("/js/front/workers/convert.js");

          const setDownload = ({ data: imageData }) => {
            const extension = settings.format;

            getDataURL(imageData, extension).then((url) =>
              face.setDownload(url, extension)
            );

            finished++;

            if (finished === 6) {
              finished = 0;
              workers = [];
            }
          };

          const setPreview = ({ data: imageData }) => {
            const x = imageData.width * position.x;
            const y = imageData.height * position.y;

            getDataURL(imageData, "jpg").then((url) =>
              face.setPreview(url, x, y)
            );

            worker.onmessage = setDownload;
            worker.postMessage(options);
          };

          worker.onmessage = setPreview;
          worker.postMessage(
            Object.assign({}, options, {
              maxWidth: 200,
              interpolation: "linear",
            })
          );

          workers.push(worker);
        }

        element.on("click", async (e) => {
          e.preventDefault();
          const file = await ModuloArchivos.askForFile();
          loadImage(file);
        });
      },
    };
  },
];
