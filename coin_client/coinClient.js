const axios = require('axios');
const qs = require('query-string');
const _ = require('lodash');

class CoinClient {
  constructor(baseUrl, secret, hash) {
    this.api = axios.create({
      baseURL: baseUrl,
    });
    this.secret = secret;
    this.hash = hash;
  }

  generateShortLink(link) {
    return this._post(
      'link/create',
      qs.stringify({
        secret: this.secret,
        url: link,
        hashes: this.hash,
      })
    ).then(result => {
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
