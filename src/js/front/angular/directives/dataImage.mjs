import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloArchivos } from "../../../common/ModuloArchivos.mjs";
import { ModuloImg } from "../../common/ModuloImg.mjs";

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
          transparency: "false",
        };

        scope.lookForImage = async function () {
          const e = await ModuloImg.lookForImage();
          const modalElement = scope.refModal.elem;
          const canvas = $(modalElement).find("canvas")[0];
          scope.currentImage = new Image();
          scope.currentImage.crossOrigin = "anonymous";
          scope.currentImage.onload = function () {
            const data1 = ModuloImg.computeDefaultOrientation(
              canvas,
              scope.currentImage
            );
            scope.data.orientation = data1.orientation;
            scope.data.alignment = data1.alignment;
            ModuloImg.paintImageOnCanvas(
              canvas,
              scope.currentImage,
              true,
              scope.data
            );
            scope.data.countChanges++;
            scope.$digest();
          };
          scope.currentImage.src = e.target.result;
        };

        scope.updateImageBounds = function () {
          const modalElement = scope.refModal.elem;
          const canvas = $(modalElement).find("canvas")[0];
          ModuloImg.paintImageOnCanvas(
            canvas,
            scope.currentImage,
            true,
            scope.data
          );
        };

        scope.save = async function () {
          if (scope.data.countChanges > 0) {
            const modalElement = scope.refModal.elem;
            const canvas = $(modalElement).find("canvas")[0];
            let localPath = scope.path;
            if (scope.data.transparency == "true") {
              localPath += ".png";
            } else {
              localPath += ".jpg";
            }
            const rta = await ModuloArchivos.uploadFile({
              own: false,
              //path: '${YYYY}${MM}${DD}-${HH}${mm}${ss}${zz}.jpg'
              path: localPath,
              data: canvas,
            });
            ngModel.$viewValue.src = rta.pub;
          }
          ngModel.$viewValue.alt = scope.content.alt;
          ngModel.$render();
          scope.$digest();
          scope.refModal.closeFunction();
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
            urlTemplate: "/js/front/angular/directives/dataImageModal.html",
            size: "lg",
            preShow: function (modalElement) {
              const canvas = $(modalElement).find("canvas")[0];
              const img = $(element)[0];

              canvas.width = img.width;
              canvas.height = img.height;

              ModuloImg.paintImageOnCanvas(canvas, img, false);

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
