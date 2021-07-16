export const dataAnchorScroll = [
  function () {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        const elemento = $(element);
        const href = elemento.attr("href");
        elemento.on("click", async (e) => {
          e.preventDefault();
          $("html, body").animate(
            {
              scrollTop: $(href).offset().top,
            },
            800
          );
        });
      },
    };
  },
];
