import { ModuloArchivos } from "../../../../../js/common/ModuloArchivos.mjs";
import { ModuloModales } from "../../../../../js/front/common/ModuloModales.mjs";

export const dataImage = [
  "$compile",
  function dataImage($compile) {
    return {
      restrict: "A",
      require: "ngModel",
      scope: {
        path: "=",
      },
      link: function link(scope, element, attrs, ngModel) {
        scope.predef = {
          src: $(element).attr("default"),
          alt: "Texto alternativo",
        };
        scope.data = {
          countChanges: 0,
          orientation: "horizontal",
          alignment: "center",
        };

        scope.lookForImage = async function () {
          try {
            const myfile = await ModuloArchivos.askForFile({});
            if (myfile) {
              var reader = new FileReader();
              reader.onload = function (e) {
                const modalElement = scope.refModal.elem;
                const canvas = $(modalElement).find("canvas")[0];
                const ctx = canvas.getContext("2d");
                scope.currentImage = new Image();
                scope.currentImage.onload = function () {
                  paintImageOnCanvas(ctx, canvas, scope.currentImage, true);
                  scope.data.countChanges++;
                  scope.$digest();
                };
                scope.currentImage.src = e.target.result;
              };
              reader.readAsDataURL(myfile);
            }
          } catch (e) {
            ModuloModales.alert({ message: e });
          }
        };

        scope.updateImageBounds = function () {
          const modalElement = scope.refModal.elem;
          const canvas = $(modalElement).find("canvas")[0];
          const ctx = canvas.getContext("2d");
          paintImageOnCanvas(ctx, canvas, scope.currentImage, true);
        };

        scope.save = async function () {
          if (scope.data.countChanges > 0) {
            const modalElement = scope.refModal.elem;
            const canvas = $(modalElement).find("canvas")[0];
            const rta = await ModuloArchivos.uploadFile({
              own: false,
              //path: '${YYYY}${MM}${DD}-${HH}${mm}${ss}${zz}.jpg'
              path: scope.path,
              data: canvas,
            });
            ngModel.$viewValue.src = rta.pub;
          }
          ngModel.$viewValue.alt = scope.content.alt;
          ngModel.$render();
          scope.$digest();
          scope.refModal.closeFunction();
        };

        const paintImageOnCanvas = function (ctx, canvas, img, computeBounds) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Se debe calcular cómo pintar la imagen
          const proporcion = canvas.width / canvas.height;
          let imgw = img.width;
          let imgx = 0;
          let imgh = img.height;
          let imgy = 0;
          let canvasx = 0;
          let canvasy = 0;
          if (computeBounds) {
            if (scope.data.orientation == "vertical") {
              // Se debe hacer fit de la altura
              imgw = img.height * proporcion;
              imgh = img.height;
              if (imgw < img.width) {
                // La imagen resulta más grande, toca reubicar en la imagen
                const diff = img.width - imgw;
                if (scope.data.alignment == "major") {
                  imgx += diff;
                } else if (scope.data.alignment == "center") {
                  imgx += diff / 2;
                }
              } else {
                // La imagen resulta más pequeña, toca reubicar el canvas
                const diff = canvas.width - imgw * (canvas.width / img.width);
                if (scope.data.alignment == "major") {
                  canvasx -= diff / 2;
                } else if (scope.data.alignment == "center") {
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
                if (scope.data.alignment == "major") {
                  imgy += diff;
                } else if (scope.data.alignment == "center") {
                  imgy += diff / 2;
                }
              } else {
                // La imagen resulta más pequeña, toca reubicar el canvas
                const diff =
                  canvas.height - imgh * (canvas.height / img.height);
                if (scope.data.alignment == "major") {
                  canvasy -= diff / 2;
                } else if (scope.data.alignment == "center") {
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
        };

        scope.openEditor = async function () {
          if (!ngModel.$viewValue) {
            ngModel.$setViewValue(scope.predef);
          }
          scope.content = {
            alt: ngModel.$viewValue.alt,
            src: ngModel.$viewValue.src,
          };
          scope.refModal = await ModuloModales.basic({
            urlTemplate: "/1/tutorials/tuto3/js/directives/dataImageModal.html",
            size: "lg",
            preShow: function (modalElement) {
              const canvas = $(modalElement).find("canvas")[0];
              const ctx = canvas.getContext("2d");
              const img = $(element)[0];

              canvas.width = img.width;
              canvas.height = img.height;

              paintImageOnCanvas(ctx, canvas, img, false);

              scope.$digest();
            },
            angular: {
              scope: scope,
              compile: $compile,
            },
          });
        };

        element.bind("click", scope.openEditor);

        ngModel.$render = function () {
          if (ngModel.$viewValue) {
            $(element).attr(
              "src",
              ngModel.$viewValue.src ? ngModel.$viewValue.src : scope.predef.src
            );
            $(element).attr(
              "alt",
              ngModel.$viewValue.alt ? ngModel.$viewValue.alt : scope.predef.alt
            );
          } else {
            $(element).attr("src", scope.predef.src);
            $(element).attr("alt", scope.predef.alt);
          }
        };
      },
    };
  },
];
