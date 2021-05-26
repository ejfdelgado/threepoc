import { ModuloArchivos } from "../../../../../js/common/ModuloArchivos.mjs";
import { ModuloModales } from "../../../../../js/front/common/ModuloModales.mjs";

export function dataImage() {
  return {
    restrict: "A",
    scope: {
      imageDetail: "=detail",
      path: "=path",
    },
    template: '<img ng-src="{{ imageDetail.src }}" ng-click="evento()"/>',
    link: function link(scope, element, attrs) {
      scope.evento = async function () {
        try {
          const rta = await ModuloArchivos.uploadFile({
            own: false,
            //path: '${YYYY}${MM}${DD}-${HH}${mm}${ss}${zz}.jpg'
            path: scope.path,
          });
          scope.imageDetail.src = rta.pub;
          scope.$digest();
        } catch (e) {
          ModuloModales.alert({ message: e });
        }
      };
    },
  };
}
