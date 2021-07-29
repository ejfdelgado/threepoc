import { Utilidades } from "../../../common/Utilidades.mjs";

export class ThreejsComponentClass {
  constructor($scope, $rootScope) {
    console.log("Hey!");
  }
}

const RECOMPUTED_PATH = Utilidades.recomputeUrl(
  location,
  $("base").attr("href")
);

export const ThreejsComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: `${RECOMPUTED_PATH.pathname}html/index.html`,
  controller: ["$scope", "$rootScope", ThreejsComponentClass],
};
