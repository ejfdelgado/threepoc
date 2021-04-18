export class TestComponentClass {
  constructor($scope) {
    this.$scope = $scope;
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
  templateUrl: "/1/tutorials/tuto1/js/components/TestComponent.html",
  controller: TestComponentClass,
};
