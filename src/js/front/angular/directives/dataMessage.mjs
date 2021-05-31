export const dataMessage = [
  "$rootScope",
  function ($rootScope) {
    return {
      restrict: "A",
      scope: {
        message: "=",
        eventName: "=",
      },
      link: function (scope, element, attrs, ngModel) {
        element.bind("click", function (event) {
          event.preventDefault();
          $rootScope.$broadcast(scope.eventName, scope.message);
        });
      },
    };
  },
];
