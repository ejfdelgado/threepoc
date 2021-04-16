import { CalendarModule } from "../../../js/front/angular/modules/CalendarModule.mjs";
import { IdGen } from "../../../js/common/IdGen.mjs";

export const AppModule = angular.module("app", [CalendarModule, "ui.router"])
  .name;

IdGen.ahora().then((fecha) => {
  console.log(fecha);
});
