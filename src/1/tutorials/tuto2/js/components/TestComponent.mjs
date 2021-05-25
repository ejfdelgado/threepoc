import { ModuloPagina } from "../../../../../js/front/page/ModuloPagina.mjs";
import { ModuloDatoSeguro } from "../../../../../js/common/ModuloDatoSeguro.mjs";

export const TestComponent = {
  bindings: {
    page: "<",
  },
  templateUrl: "/1/tutorials/tuto2/js/components/TestComponent.html",
  controller: [
    "$scope",
    "$compile",
    class TestComponentClass {
      constructor($scope, $compile) {
        this.$compile = $compile;
        this.$scope = $scope;
        this.cipher = {
          pubkey:
            "MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAKTv23oLW7qLGq0bd+lMrkh4v1SZJd5p" +
            "RklCZtbdyzy5AgMBAAE=",
          privkey:
            "MIHDAgEAMA0GCSqGSIb3DQEBAQUABIGuMIGrAgEAAiEApO/begtbuosarRt36Uyu" +
            "SHi/VJkl3mlGSUJm1t3LPLkCAwEAAQIgbTjlJ2m0IdESJkZFXvpHgmgcrZSTHzgC" +
            "bjZFrFTE6/ECEQDUmv9Ih/OmaYP5wN43MV4FAhEAxpoZCLf9oWmhrj/HGUDuJQIQ" +
            "SS+R8UXbec2YwMDDvfwggQIRALtjuQ1F9dWwgrKUUPseDdUCEQDBOo07h038/EJf" +
            "2H+kAqF3",
        };
      }
      cifrar() {
        const pubkey = this.cipher.pubkey;
        const data = this.cipher.data;
        this.cipher.data = ModuloDatoSeguro.cifrar(data, pubkey);
      }
      decifrar() {
        const privkey = this.cipher.privkey;
        const data = this.cipher.data;
        this.cipher.data = ModuloDatoSeguro.decifrar(data, privkey);
      }
      search() {
        ModuloPagina.showSearchPages();
      }
      createNew() {
        ModuloPagina.createNewPage().then((rta) => {
          window.open(rta.url, "_blank");
        });
      }
      editPage() {
        ModuloPagina.editPage({
          angular: {
            //scope: this.$scope,
            //compile: this.$compile,
            ctrl: this,
          },
        });
      }
      async savePage() {
        console.log("salvar?");
      }
      $onInit() {
        this.message = "I'm master!";
      }
      $onChanges(changesObj) {
        // Replaces the $watch()
      }
      $onPostLink() {
        // When the component DOM has been compiled attach you eventHandler.
      }
      $postLink() {
        //
      }
    },
  ],
};
