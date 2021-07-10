export const templateDiscoverInterceptor = [
  "ngifSearch",
  function (ngifSearch) {
    return {
      request: function (config) {
        return config;
      },

      response: function (response) {
        const url = response.config.url;
        const data = response.data;
        const ngifList = [];

        const re = /<.*?ng-if="([^"]+)".*?>/g;
        let m;

        do {
          m = re.exec(data);
          if (m) {
            const nuevo = { key: m[1] };
            const partesMensaje = /message="([^"]+)"/.exec(m[0]);
            if (partesMensaje != null) {
              nuevo.message = partesMensaje[1];
            }
            ngifList.push(nuevo);
          }
        } while (m);

        //console.log(`Discovering ${url}`);
        ngifSearch.register(url, ngifList);

        return response;
      },
    };
  },
];
