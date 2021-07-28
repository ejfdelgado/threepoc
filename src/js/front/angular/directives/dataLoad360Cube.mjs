export const dataLoad360Cube = [
  "load360ImageService",
  function (load360ImageService) {
    return {
      restrict: "A",
      scope: {},
      link: function (scope, element, attrs) {
        element.on("click", async (e) => {
          e.preventDefault();
          const rta = await load360ImageService.get({
            size: 500,
            format: "jpg",
            path: "/360cube"
          });
          console.log(JSON.stringify(rta, null, 4));
        });
      },
    };
  },
];
