
import { CalendarModule } from "../../../node_local/front/angular/modules/CalendarModule.mjs"
import { IdGen } from "../../../node_local/common/IdGen.mjs"

export const AppModule = angular
  .module("app", [CalendarModule, "ui.router"]).name;

  IdGen.ahora().then(fecha => {
    console.log(fecha);
  })