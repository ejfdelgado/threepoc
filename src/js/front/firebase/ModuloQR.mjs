import { ModuloIntMark } from "./ModuloIntMark.mjs";

export class ModuloQR {
  static async showQR() {
    const datos = await ModuloIntMark.getDiferidoIntMark();
    console.log("diferidoId ok");
    var divSlave = $("#imslave");
    var divMaster = $("#immaster");
    if (datos.tipo == "master") {
      divSlave.remove();
      var elemQrCode = $("#qrcode");
      if (elemQrCode.length > 0) {
        const veces = 3;
        elemQrCode.qrcode({
          width: 41 * veces,
          height: 41 * veces,
          text: datos.slaveUrl,
        });
      }
      divMaster.removeClass("invisible");
    } else {
      divMaster.remove();
      divSlave.removeClass("invisible");
    }
  }
}
