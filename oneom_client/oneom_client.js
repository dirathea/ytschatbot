const axios = require('axios');

class oneomClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    searchSeries(title) {
        return this._get(`/search/serial?title=${title.toLowerCase()}`);
    }

    seriesDetails(id) {
        return this._get(`/serial/${id}`);
    }

    getImageUrl(imageName){
        return `https://fileom.s3.amazonaws.com/serial/max/${imageName}`;
    }

    _get(url) {
        console.log(`series request ${url}`);
        return axios.get(`${this.baseUrl}${url}`, {headers: {
            'Accept': 'application/json'
        }})
            .then(response => response.data)
            .catch(err => console.log(err));
    }
}

module.exports = oneomClient;