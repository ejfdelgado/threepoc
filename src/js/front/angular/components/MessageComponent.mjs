import { ModuloTupla } from "../../page/ModuloTupla.mjs";

export class MessageComponentClass {
  constructor($scope) {
    this.$scope = $scope;
  }
  save() {
    for (let domain in this.domains) {
      const valor = this.domains[domain];
      this.services[domain].guardar(valor);
    }
  }
  add(list) {
    list.push({value: ""});
  }
  remove(list) {
    if (list.length > 0) {
      list.splice(list.length-1, 1);
    }
  }
  $onInit() {
    console.log(this.page);

    this.domains = {};
    this.services = {};
    const PRUEBA = ["", "other", "external"];
    for (let i = 0; i < PRUEBA.length; i++) {
      this.readDomain(PRUEBA[i], { list: [] });
    }
  }
  async readDomain(domain = "", predefined = {}) {
    const opciones = { dom: domain };
    if (domain == "null") {
      opciones.dom = null;
    }
    const servicio = new ModuloTupla(opciones);
    this.services[domain] = servicio;
    let rta = await servicio.leer();
    rta = Object.assign(predefined, rta);
    delete rta.value;
    this.domains[domain] = rta;
    await servicio.guardar(rta);
    this.$scope.$digest();
  }
  $onChanges(changesObj) {
    // Replaces the $watch()
    console.log(changesObj);
  }
  $onPostLink() {
    // When the component DOM has been compiled attach you eventHandler.
  }
  $postLink() {
    console.log("postLink");
  }
}

export const MessageComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: "/js/front/angular/components/MessageComponent.html",
  controller: MessageComponentClass,
};
