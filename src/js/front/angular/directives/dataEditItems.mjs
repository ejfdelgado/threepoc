import { ModuloModales } from "../../common/ModuloModales.mjs";
import { IdGen } from "../../../common/IdGen.mjs";

export const dataEditItems = [
  "$rootScope",
  "$filter",
  function ($rootScope, $filter) {
    return {
      restrict: "E",
      require: "ngModel",
      scope: {
        key: "=",
        predefined: "=",
      },
      template:
        '<button ng-click="removeItem()">x</button>\
        <button ng-click="addItem()">+</button>\
      <button ng-click="moveUpItem()">up</button>\
      <button ng-click="moveDownItem()">down</button>',
      link: function (scope, element, attrs, ngModel) {
        scope.removeItem = async function () {
          const acepto = await ModuloModales.confirm();
          if (!acepto) {
            return;
          }
          const llaves = Object.keys(ngModel.$viewValue);
          for (let i = 0; i < llaves.length; i++) {
            const llave = llaves[i];
            const item = ngModel.$viewValue[llave];
            if (item.order == scope.key) {
              delete ngModel.$viewValue[llave];
              $rootScope.$digest();
              break;
            }
          }
        };
        scope.addItem = async function () {
          if ([null, undefined].indexOf(ngModel.$viewValue) >= 0) {
            ngModel.$setViewValue({});
          }
          const newId = await IdGen.nuevo();
          const nuevo = JSON.parse(JSON.stringify(scope.predefined));
          ngModel.$viewValue[newId] = nuevo;
          // Acá se debería ajustar el order de los que sean necesarios para
          // ubicarlo en el lugar correcto; antes o después
          nuevo.order = newId;
          $rootScope.$digest();
        };
        scope.moveUpItem = function () {
          const arreglo = $filter("orderItem")(ngModel.$viewValue);
          let actual = null;
          let indice = -1;
          for (let i = 0; i < arreglo.length; i++) {
            if (arreglo[i].order == scope.key) {
              actual = arreglo[i];
              indice = i;
              break;
            }
          }
          if (indice <= 0) {
            return;
          }
          const otroElemento = arreglo[indice - 1];
          actual.order = otroElemento.order;
          otroElemento.order = scope.key;
        };
        scope.moveDownItem = async function () {
          const arreglo = $filter("orderItem")(ngModel.$viewValue);
          let actual = null;
          let indice = -1;
          for (let i = 0; i < arreglo.length; i++) {
            if (arreglo[i].order == scope.key) {
              actual = arreglo[i];
              indice = i;
              break;
            }
          }
          if (indice < 0 || indice == arreglo.length - 1) {
            return;
          }
          const otroElemento = arreglo[indice + 1];
          actual.order = otroElemento.order;
          otroElemento.order = scope.key;
        };
      },
    };
  },
];
