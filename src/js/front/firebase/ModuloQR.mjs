import { ModuloIntMark } from "./ModuloIntMark.mjs";
import { ShortUrl } from "../page/ShortUrl.mjs";

export class ModuloQR {
  static VECES = 3;
  static async get(jElement, url) {
    const shortUrl = await ShortUrl.get(url);
    jElement.qrcode({
      width: 41 * ModuloQR.VECES,
      height: 41 * ModuloQR.VECES,
      text: shortUrl,
    });
    jElement.attr('href', shortUrl);
  }
  static async showQR() {
    const datos = await ModuloIntMark.getDiferidoIntMark();
    console.log("diferidoId ok");
    var divSlave = $("#imslave");
    var divMaster = $("#immaster");
    if (typeof datos.slaveUrl != "string") {
      return;
    }
    if (datos.tipo == "master") {
      divSlave.remove();
      var elemQrCode = $("#qrcode");
      if (elemQrCode.length > 0) {
        elemQrCode.qrcode({
          width: 41 * ModuloQR.VECES,
          height: 41 * ModuloQR.VECES,
          text: datos.slaveUrl,
        });
        elemQrCode.on("click", function () {
          window.open(datos.slaveUrl, "_blank");
        });
      }
      divMaster.removeClass("invisible");
    } else {
      divMaster.remove();
      divSlave.removeClass("invisible");
    }
  }
}
