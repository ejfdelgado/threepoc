import { TodoComponent } from "../components/TodoComponent.mjs";

export const CalendarModule = angular
  .module("calendar", ["ui.router"])
  .component("calendarcom", TodoComponent)
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    ($stateProvider, $urlRouterProvider) => {
      console.log("configuring routing");
      $stateProvider.state("calendar", {
        url: "/calendar",
        component: "calendarcom",
      });
      $urlRouterProvider.otherwise("/");
      console.log("configuring routing ok!");
    },
  ]).name;
