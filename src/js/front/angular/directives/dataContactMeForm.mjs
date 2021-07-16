import { ModuloModales } from "../../common/ModuloModales.mjs";

export const dataContactMeForm = [
  "mailService",
  function (mailService) {
    return {
      restrict: "A",
      scope: {},
      link: function (scope, element, attrs) {
        const params = [
          { name: "name", message: "Name" },
          { name: "email", message: "Email" },
          { name: "message", message: "Message" },
        ];

        for (let i = 0; i < params.length; i++) {
          const elem = params[i];
          elem.el = $(element).find(`[name='${elem.name}']`);
        }

        const butonEl = $(element).find("button[type='submit']");

        butonEl.on("click", async (event) => {
          event.preventDefault();
          let errorCount = 0;
          params.forEach((elem) => {
            elem.val = elem.el.val().trim();
            if (errorCount == 0 && elem.val.length == 0) {
              errorCount++;
              ModuloModales.alert({
                title: "Verify your information",
                message: `The field ${elem.message} is empty.`,
              });
            }
          });
          if (errorCount > 0) {
            return;
          }

          await mailService.contactMe(
            attrs.destination,
            params[0].val,
            params[1].val,
            params[2].val
          );
        });
      },
    };
  },
];
