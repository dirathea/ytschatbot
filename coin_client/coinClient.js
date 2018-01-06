const axios = require('axios');

class CoinClient {
  constructor(baseUrl, secret) {
    this.api = axios.create({
      baseURL: baseUrl,
    });
    this.secret = secret;
  }

  generateShortLink(link) {
    return this._post('link/create', {
      secret: this.secret,
      url: link,
      hashes: 1024,
    }).then(result => {
      if (result.success) {
        return result.url;
      }
      console.log(`error on create short link`);
      console.log(result.error);
      return link;
    });
  }

  _post(path, params) {
    return this.api
      .post(path, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then(response => response.data);
  }
}

module.exports = CoinClient;
