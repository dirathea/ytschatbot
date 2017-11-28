const os = require('opensubtitles-api');
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
                this.bucket.upload(subtitles.en.url, {
                    destination: `subtitles/${id}/en/${subtitles.en.filename}`
                }).then(response => {
                    console.log(response);
                    console.log('finish uplading');
                });
            }
        });
    }
}

module.exports = OpenSubsClient;