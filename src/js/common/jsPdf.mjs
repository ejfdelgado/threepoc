export class jsPdfLocal {
  static process(jsPdfClient, body) {
    const options = Object.assign(
      { orientation: "portrait", unit: "mm", format: "letter" },
      body.options
    );
    const doc = new jsPdfClient(options);
    for (let i = 0; i < body.elements.length; i++) {
      const elemento = body.elements[i];
      switch (elemento.type) {
        case "img":
          doc.addImage(
            elemento.data,
            "png",
            elemento.x,
            elemento.y,
            elemento.w,
            elemento.h
          );
          break;
        case "txt":
          doc.setFont(undefined, "bold");
          doc.setTextColor("#057bfe");
          doc.setFontSize(elemento.size);
          doc.text(elemento.data, elemento.x, elemento.y, elemento.align);
          break;
      }
    }
    return doc;
  }

  static processServer(body) {}
}
