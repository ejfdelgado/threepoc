import { ModuloPagina } from "../../../../../js/front/page/ModuloPagina.mjs";

export class TestComponentClass {
  constructor($scope, $compile) {
    this.$compile = $compile;
    this.$scope = $scope;
  }
  editPage() {
    ModuloPagina.editPage({
      angular: {
        scope: this.$scope,
        compile: this.$compile,
      },
    });
  }
  $onInit() {
    this.message = "I'm master!";
  }
  $onChanges(changesObj) {
    // Replaces the $watch()
  }
  $onPostLink() {
    // When the component DOM has been compiled attach you eventHandler.
  }
  $postLink() {
    //
  }
}

export const TestComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: "/1/tutorials/tuto2/js/components/TestComponent.html",
  controller: ["$scope", "$compile", TestComponentClass],
};
