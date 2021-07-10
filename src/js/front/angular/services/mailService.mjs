import { ModuloModales } from "../../common/ModuloModales.mjs";
import { ModuloPagina } from "../../page/ModuloPagina.mjs";
import { ModuloActividad } from "../../common/ModuloActividad.mjs";

export function mailService() {
  this.contactMe = async (to, name, email, message) => {
    const actividad = ModuloActividad.on();
    try {
      const body = {
        to: to,
        subject: "País - TV Some one is looking form you!",
        template: "/mail/contact-me.html",
        params: {
          name: name,
          email: email,
          message: message,
        },
      };

      const url = new URL(
        `${ModuloPagina.LOCATION_WITHOUT_PAGE.origin}/mail/send/`
      );
      const resultado = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());

      if ([202, 200].indexOf(resultado[0].statusCode) >= 0) {
        ModuloModales.alert({
          title: "Thanks!",
          message: "Your message has been sent",
        });
      } else {
        ModuloModales.alert({
          title: "Ups",
          message: `The automatic email service is not working, please write to ${to}`,
        });
      }
    } catch (e) {
      ModuloModales.alert({
        title: "Ups",
        message: `The automatic email service is not working, please write to ${to}`,
      });
    }
    actividad.resolve();
  };
}
