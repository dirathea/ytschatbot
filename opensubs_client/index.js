const os = require('opensubtitles-api');
const axios = require('axios');
const srtToVtt = require('srt-to-vtt');
const config = require('../config');
const firebase = require('firebase-admin');

const osClient = new os({
    useragent: config.OS_USER_AGENT,
    ssl: true,
});
class OpenSubsClient {
    constructor() {
        this.bucket = firebase.storage().bucket();
        this.firestore = firebase.firestore();
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
                        const subtitleFile = this.bucket.file(`subtitles/${id}/en/${subtitles.en.filename.replace('.srt', '.vtt')}`);
                        stream
                        .pipe(srtToVtt())
                        .pipe(subtitleFile.createWriteStream())
                            .on('error', err => console.log(err))
                            .on('finish', () => {
                                const expiredDate = new Date();
                                expiredDate.setMonth(expiredDate.getMonth() + 1);
                                subtitleFile.getSignedUrl({
                                    action: 'read',
                                    expires: expiredDate.toString(),
                                }, (err, url) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        this.firestore.doc(`/session/${id}`)
                                            .update({subs: url});
                                    }
                                })
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