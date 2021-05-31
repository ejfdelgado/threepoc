import { ModuloModales } from "./ModuloModales.mjs";
import { ModuloArchivos } from "../../common/ModuloArchivos.mjs";

export class ModuloImg {
  static loadImageOnCanvas(canvas, url = null) {
    return new Promise(async (resolve, reject) => {
      const currentImage = new Image();
      currentImage.crossOrigin = "anonymous";
      currentImage.onload = function () {
        const data = ModuloImg.computeDefaultOrientation(canvas, currentImage);
        ModuloImg.paintImageOnCanvas(canvas, currentImage, true, data);
        resolve();
      };
      if (url == null) {
        const e = await ModuloImg.lookForImage();
        currentImage.src = e.target.result;
      } else {
        currentImage.src = url;
      }
    });
  }
  static paintImageOnCanvas(canvas, img, computeBounds = true, data = {}) {
    const ctx = canvas.getContext("2d");
    const scope_data = Object.assign(
      {
        transparency: "true",
        orientation: "horizontal",
        alignment: "center",
      },
      data
    );
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (scope_data.transparency == "true") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // Se debe calcular cómo pintar la imagen
    const proporcion = canvas.width / canvas.height;
    let imgw = img.width;
    let imgx = 0;
    let imgh = img.height;
    let imgy = 0;
    let canvasx = 0;
    let canvasy = 0;
    if (computeBounds) {
      if (scope_data.orientation == "vertical") {
        // Se debe hacer fit de la altura
        imgw = img.height * proporcion;
        imgh = img.height;
        if (imgw < img.width) {
          // La imagen resulta más grande, toca reubicar en la imagen
          const diff = img.width - imgw;
          if (scope_data.alignment == "major") {
            imgx += diff;
          } else if (scope_data.alignment == "center") {
            imgx += diff / 2;
          }
        } else {
          // La imagen resulta más pequeña, toca reubicar el canvas
          const diff = canvas.width - imgw * (canvas.width / img.width);
          if (scope_data.alignment == "major") {
            canvasx -= diff / 2;
          } else if (scope_data.alignment == "center") {
            canvasx -= diff / 4;
          }
        }
      } else {
        // Se asume horizontal
        imgw = img.width;
        imgh = img.width / proporcion;
        if (imgh < img.height) {
          // La imagen resulta más grande, toca reubicar en la imagen
          const diff = img.height - imgh;
          if (scope_data.alignment == "major") {
            imgy += diff;
          } else if (scope_data.alignment == "center") {
            imgy += diff / 2;
          }
        } else {
          // La imagen resulta más pequeña, toca reubicar el canvas
          const diff = canvas.height - imgh * (canvas.height / img.height);
          if (scope_data.alignment == "major") {
            canvasy -= diff / 2;
          } else if (scope_data.alignment == "center") {
            canvasy -= diff / 4;
          }
        }
      }
    }
    ctx.drawImage(
      img,
      imgx,
      imgy,
      imgw,
      imgh, // source rectangle
      canvasx,
      canvasy,
      canvas.width,
      canvas.height
    ); // destination rectangle
  }

  static async lookForImage() {
    return new Promise(async (resolve, reject) => {
      try {
        const myfile = await ModuloArchivos.askForFile({});
        if (myfile) {
          var reader = new FileReader();
          reader.onload = function (e) {
            resolve(e);
          };
          reader.readAsDataURL(myfile);
        }
      } catch (e) {
        ModuloModales.alert({ message: e });
        reject(e);
      }
    });
  }

  static computeDefaultOrientation(destination, source) {
    const data = {
      orientation: "vertical",
      alignment: "center",
    };
    const destProp = destination.width / destination.height;
    const sourceProp = source.width / source.height;
    if (destProp < sourceProp) {
      data.orientation = "horizontal";
    }
    return data;
  }
}
