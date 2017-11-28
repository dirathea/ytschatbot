const os = require('opensubtitles-api');
const axios = require('axios');
const config = require('../config');
const firebase = require('firebase-admin');

const osClient = new os({
    useragent: config.OS_USER_AGENT,
    ssl: true,
});
class OpenSubsClient {
    constructor() {
        this.bucket = firebase.storage().bucket();
    }
    getSubsLink(id, params) {
        console.log("Searching subs");
        const searchParams = Object.assign(params);
        console.log(searchParams);
        return osClient.search(searchParams)
        .then(subtitles => {
            console.log(subtitles);
            if (subtitles.en) {
                this.downloadSubtitle(subtitles.en.url)
                    .then(stream => {
                        const subtitleFile = this.bucket.file(`subtitles/${id}/en/${subtitles.en.filename}`);
                        stream.pipe(subtitleFile.createWriteStream())
                            .on('error', err => console.log(err))
                            .on('finish', () => {
                                console.log('upload finished');
                            })
                    });
            }
        });
    }

    downloadSubtitle(url) {
        console.log(`Downloading ${url}`);
        return axios.get(url, 
            {
                responseType: 'stream',
            })
            .then(resp => resp.data);
    }


}

module.exports = OpenSubsClient;