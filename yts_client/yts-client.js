/**
 * Created by aldiraraharja on 1/15/17.
 */
'use strict';

const Promise = require('bluebird');
const axios = require('axios');

const OK = 'ok';
const ERROR = 'error';

class YtsClient {
  constructor(BASE_URL) {
    this.BASE_URL = BASE_URL;
  }

  listMovie(searchParams) {
    const defaultSearchTerms = {
      limit: 10,
    };
    return this._get(
      'list_movies',
      Object.assign(defaultSearchTerms, searchParams)
    );
  }

  searchMovie(term) {
    return this.listMovie({
      query_term: term,
    });
  }

  movieDetails(params) {
    const defaultParams = {
      with_images: true,
      with_cast: true,
    };
    return this._get('movie_details', Object.assign(defaultParams, params));
  }

  getMovie(movieId) {
    return this.movieDetails({ movie_id: movieId });
  }

  listUpcoming() {
    return this._get('list_upcoming');
  }

  _get(endpoint, query) {
    console.log(`requesting to ${endpoint}`);
    console.log(query);
    return axios
      .get(`${this.BASE_URL}${endpoint}.json`, {
        params: query,
      })
      .then(response => response.data)
      .catch(err => {
        console.log(err);
      });
  }

  _post(endpoint, payload) {
    return axios
      .post(`${this.BASE_URL}${endpoint}.json`, payload)
      .then(response => response.data)
      .catch(err => console.log(err));
  }
}

module.exports = YtsClient;
