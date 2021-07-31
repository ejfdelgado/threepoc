import { Utilidades } from "../../../common/Utilidades.mjs";

export class ThreejsComponentClass {
  constructor($scope, $rootScope) {
    this.$scope = $scope;
  }

  $onInit() {
    const commonBackground =
      "https://storage.googleapis.com/proyeccion-colombia1.appspot.com/public/usr/anonymous/1/html/cv/pg/5677287789821952/360cube/";
    this.$scope.$ctrl.models = {
      a1: {
        rotateCameraOnScroll: true,
        objects: [],
        size: {
          w: "100%",
          h: "50vh",
        },
        background: {
          url: "/z/img/360/",
        },
        camera: {
          fov: 80,
          near: 1,
          far: 100,
          position: [0, 0, 0],
        },
      },
      a2: {
        control: "orbit",
        rotateModelsOnScroll: true,
        objects: [
          {
            url: "./data/scene/scene01.json",
          },
        ],
        background: {
          rgb: 0xbfe3dd,
        },
        camera: {
          position: [5, 2, 8],
        },
      },
      a3: {
        control: "orbit",
        rotateModelsOnScroll: true,
        objects: [
          {
            url: "./data/scene/scene03.json",
          },
        ],
        background: {
          url: commonBackground,
        },
        camera: {
          position: [5, 2, 50],
        },
      },
    };
  }
}

const RECOMPUTED_PATH = Utilidades.recomputeUrl(
  location,
  $("base").attr("href")
);

export const ThreejsComponent = {
  templateUrl: `${RECOMPUTED_PATH.pathname}html/index.html`,
  controller: ["$scope", "$rootScope", ThreejsComponentClass],
};
