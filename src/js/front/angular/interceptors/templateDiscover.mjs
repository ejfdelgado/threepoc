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

        const re = /ng-if="([^"]+)"[^>]+message="([^"]+)"/g;
        let m;

        do {
          m = re.exec(data);
          if (m) {
            const nuevo = { key: m[1], message: m[2] };
            ngifList.push(nuevo);
          }
        } while (m);

        ngifSearch.register(url, ngifList);

        return response;
      },
    };
  },
];
