import { ModuloPagina } from "../../../../../js/front/page/ModuloPagina.mjs";

export const TestComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: "/1/tutorials/tuto2/js/components/TestComponent.html",
  controller: [
    "$scope",
    "$compile",
    class TestComponentClass {
      constructor($scope, $compile) {
        this.$compile = $compile;
        this.$scope = $scope;
      }
      search() {
        ModuloPagina.showSearchPages();
      }
      createNew() {
        ModuloPagina.createNewPage().then((rta) => {
          window.open(rta.url, "_blank");
        });
      }
      editPage() {
        ModuloPagina.editPage({
          angular: {
            //scope: this.$scope,
            //compile: this.$compile,
            ctrl: this,
          },
        });
      }
      async savePage() {
        console.log("salvar?");
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
    },
  ],
};
