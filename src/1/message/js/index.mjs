import { MessageModule } from "./MessageModule.mjs";

export const AppModule = angular.module("app", [MessageModule, "ui.router"])
  .name;