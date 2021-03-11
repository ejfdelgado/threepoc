
import { CalendarModule } from "../../../node_local/front/angular/modules/CalendarModule.mjs"

export const AppModule = angular
  .module("app", [CalendarModule, "ui.router"]).name;
