export class TestComponentSlaveClass {
  constructor($scope) {
    this.$scope = $scope;
  }
  $onInit() {
    this.message = "I'm slave!";
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

export const TestComponentSlave = {
  bindings: {
    page: "<",
  },
  templateUrl: "/1/tutorials/tuto2/js/components/TestComponentSlave.html",
  controller: TestComponentSlaveClass,
};
