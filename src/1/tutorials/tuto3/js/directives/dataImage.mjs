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
        scope.countChanges = 0;
        scope.lookForImage = async function () {
          try {
            const myfile = await ModuloArchivos.askForFile({});
            if (myfile) {
              var reader = new FileReader();
              reader.onload = function (e) {
                const modalElement = scope.refModal.elem;
                const canvas = $(modalElement).find("canvas")[0];
                const ctx = canvas.getContext("2d");
                const img = new Image();
                img.onload = function () {
                  paintImageOnCanvas(ctx, canvas, img);
                  scope.countChanges++;
                };
                img.src = e.target.result;
              };
              reader.readAsDataURL(myfile);
            }
          } catch (e) {
            ModuloModales.alert({ message: e });
          }
        };

        scope.save = async function () {
          if (scope.countChanges > 0) {
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

        const paintImageOnCanvas = function (ctx, canvas, img) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height, // source rectangle
            0,
            0,
            canvas.width,
            canvas.height
          ); // destination rectangle
        };

        scope.openEditor = async function () {
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

              paintImageOnCanvas(ctx, canvas, img);

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
          $(element).attr("src", ngModel.$viewValue.src);
          $(element).attr("alt", ngModel.$viewValue.alt);
        };
      },
    };
  },
];
