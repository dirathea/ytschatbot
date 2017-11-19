/**
 * Created by aldiraraharja on 1/15/17.
 */
'use strict';

const Promise = require('bluebird');
const unirest = require('unirest');

const OK = 'ok';
const ERROR = 'error';

class YtsClient {

    constructor(BASE_URL) {
        this.BASE_URL = BASE_URL
    }

    listMovie(searchParams) {
        const defaultSearchTerms = {
            limit: 10,
        }
        return this._get('list_movies', Object.assign(defaultSearchTerms, searchParams));
    }

    searchMovie(term) {
        return this.listMovie({
            query_term: term
        });
    }

    movieDetails(params) {
        const defaultParams = {
            with_images: true,
            with_cast: true,
        }
        return this._get('movie_details', Object.assign(defaultParams, params));
    }

    getMovie(movieId) {
        return this.movieDetails({movie_id: movieId});
    }

    listUpcoming() {
        return this._get('list_upcoming');
    }

    _get(endpoint, query) {
        console.log(`requesting to ${endpoint}`);
        console.log(query);
        return new Promise((resolve, reject) => {
            unirest.get(`${this.BASE_URL}${endpoint}.json`)
                .query(query)
                .end((response) => {
                    const responseData = response.body;
                    console.log(responseData);
                    if (responseData.status === ERROR) {
                        return reject(responseData.status_message);
                    }
                    resolve(responseData.data);
                })
        });
    }

    _post(endpoint, payload) {
        return new Promise((resolve, reject) => {
            unirest.post(`${this.BASE_URL}${endpoint}.json`)
                .send(payload)
                .end((response) => {
                    const responseData = response.body;
                    console.log(responseData);
                    if (responseData.status === ERROR) {
                        return reject(responseData.status_message);
                    }
                    return resolve(responseData.data);
                })
        });
    }
}

module.exports = YtsClient;