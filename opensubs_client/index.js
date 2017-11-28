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
            const downloadProcess = Object.keys(subtitles)
                .map(lang => {
                    return this.downloadSubtitle(subtitles[lang].url)
                        .then(stream => {
                            return new Promise((resolve, reject) => {
                                const subtitleFile = this.bucket.file(`subtitles/${id}/${lang}/${subtitles[lang].filename.replace('.srt', '.vtt')}`);
                                stream
                                .pipe(srtToVtt())
                                .pipe(subtitleFile.createWriteStream())
                                    .on('error', err => console.log(err))
                                    .on('finish', () => {
                                        console.log(subtitles[lang]);
                                        const expiredDate = new Date();
                                        expiredDate.setMonth(expiredDate.getMonth() + 1);
                                        subtitleFile.getSignedUrl({
                                            action: 'read',
                                            expires: expiredDate.toString(),
                                        }, (err, url) => {
                                            if (err) {
                                                console.log(err);
                                                return resolve({
                                                    lang,
                                                    langName: subtitles[lang].langname,
                                                    url: ''
                                                });
                                            } else {
                                                return resolve({
                                                    lang,
                                                    langName: subtitles[lang].langname,
                                                    url
                                                });
                                            }
                                        });
                                    })
                            });
                        });
                });
                return Promise.all(downloadProcess)
                    .then(result => {
                        console.log(result);
                        this.firestore.doc(`/session/${id}`)
                        .update({subs: result})
                        .then(() => {
                            console.log(`All supported subs ready`);
                            return Promise.resolve();
                        })
                        .catch(err => {
                            console.log(err);
                            return Promise.resolve();
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        return Promise.resolve();
                    });
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