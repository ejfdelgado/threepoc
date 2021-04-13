export const MessageComponent = {
  bindings: {
    page: '<',
  },
  templateUrl: "/js/front/angular/components/MessageComponent.html",
  controller: class MessageComponent {
    constructor() {
      console.log("constructor");
      this.dato = {
        valor: "Modifícame",
      };
    }
    save() {
      alert("save!");
    }
    $onInit() {

    }
    $onChanges(changesObj) {

    }
  },
};
