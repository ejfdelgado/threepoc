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
  addRol(list) {
    list.push({ v: "" });
  }
  removeRol(contenido, indice) {
    const list = contenido.roles;
    if (indice < list.length) {
      list.splice(indice, 1);
    }
  }
  removeUsr(contenidoDominio, usuario) {
    delete contenidoDominio[usuario];
  }
  addUsr(contenidoDominio) {
    contenidoDominio[this.temp.name] = { roles: [] };
  }
  $onInit() {
    console.log(this.page);
    this.temp = {
      name: btoa("google.com/edgar.jose.fernando.delgado@gmail.com"),
    };
    this.domains = {};
    this.services = {};
    const PRUEBA = [
      { name: "security", useSubDomain: true, pred: {} },
      { name: "other", useSubDomain: false, pred: {} },
    ];
    for (let i = 0; i < PRUEBA.length; i++) {
      const unaPrueba = PRUEBA[i];
      this.readDomain(unaPrueba.name, unaPrueba.pred, unaPrueba.useSubDomain);
    }
  }
  async readDomain(domain = "", predefined = {}, useSubDomain) {
    const opciones = { dom: domain, useSubDomain: useSubDomain };
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
