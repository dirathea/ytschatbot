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
        this.storageRef = firebase.storage().ref();
    }
    getSubsLink(id, params) {
        console.log("Searching subs");
        const searchParams = Object.assign(params);
        console.log(searchParams);
        return osClient.search(searchParams)
        .then(subtitles => {
            console.log(subtitles);
            if (subtitles.en) {
                const subsRef = this.storageRef.child(`subs/${id}/en/${subtitles.en.filename}`);
                return axios.get(subtitles.en.url)
                    .then(resp => {
                        subsRef.put(resp.data)
                            .then(snapshot => {
                                console.log('Subtitle is uploaded');
                            });
                    });
            }
        });
    }
}

module.exports = OpenSubsClient;