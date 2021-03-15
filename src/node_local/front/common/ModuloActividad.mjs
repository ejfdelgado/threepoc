export class ModuloActividad {
  static TEMPLATE_DIV =
    '<div class="loading_micodigo_core_lib invisible">\
    <div class="imagen_micodigo_core_lib"></div>\
    <div class="contenido_micodigo_core_lib">\
        <div></div>\
    </div>\
  </div>';

  static encolados = [];

  static actualizar(opciones) {
    if ($(".loading_micodigo_core_lib").length == 0) {
      $("body").append($(TEMPLATE_DIV));
    }
    var settings = $.extend(
      true,
      {},
      {
        clase_img: "panal",
        contenido: "",
      },
      opciones
    );
    var tam = encolados.length;
    if (tam > 0) {
      var imagen = $(".loading_micodigo_core_lib .imagen_micodigo_core_lib");
      imagen.attr("class", "imagen_micodigo_core_lib");
      imagen.addClass(settings["clase_img"]);

      $(".loading_micodigo_core_lib .contenido_micodigo_core_lib").html(
        settings["contenido"]
      );

      $(".loading_micodigo_core_lib").removeClass("invisible");
    } else {
      $(".loading_micodigo_core_lib").addClass("invisible");
    }
  }

  static on(opciones) {
    //Debe devolver un diferido
    var diferido = $.Deferred();

    var settings = $.extend(true, {}, {}, opciones);

    encolados.push(diferido);

    diferido.promise().always(function () {
      var indice = encolados.indexOf(diferido);
      if (indice >= 0) {
        encolados.splice(indice, 1);
      }
      actualizar(settings);
    });
    actualizar(settings);

    if (typeof settings["timeout"] == "number") {
      setTimeout(function () {
        diferido.resolve();
      }, settings["timeout"]);
    }

    return diferido;
  }
}
