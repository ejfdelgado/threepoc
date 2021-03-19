export class ModuloArchivos {
  static async guardarContenidoEstatico() {
    // Debo tomar la url y guardar el archivo basado en eso
    // /ruta/index.htm -> /ruta/index.html (notar la "l")
    const ruta = location.pathname;
    const markup = document.documentElement.innerHTML;
    console.log(markup);
  }
}
