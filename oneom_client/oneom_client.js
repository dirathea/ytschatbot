const axios = require('axios');
const axiosExtensions = require('axios-extensions');

class oneomClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.api = axios.create({
            baseURL: baseUrl,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            adapter: axiosExtensions.cacheAdapterEnhancer(axios.default.adapter, true)
        });
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
        return this.api.get(url)
            .then(response => response.data)
            .catch(err => console.log(err));
    }
}

module.exports = oneomClient;