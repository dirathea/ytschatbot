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
        return this.firestore.doc(`/subs/${params.imdbid}`)
            .get()
            .then(snapshot => {
                if (snapshot.exists) {
                    return this.firestore.doc(`/session/${id}`)
                        .update({subs: snapshot.doc()});
                }
                return osClient.search(params)
                .then(subtitles => {
                    const downloadProcess = Object.keys(subtitles)
                        .map(lang => {
                            return this.downloadSubtitle(subtitles[lang].url)
                                .then(stream => {
                                    return new Promise((resolve, reject) => {
                                        const subtitleFile = this.bucket.file(`subtitles/${params.imdbid}/${lang}/${subtitles[lang].filename.replace('.srt', '.vtt')}`);
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
                                                            lang: subtitles[lang].langcode,
                                                            langName: subtitles[lang].lang,
                                                            url: ''
                                                        });
                                                    } else {
                                                        return resolve({
                                                            lang: subtitles[lang].langcode,
                                                            langName: subtitles[lang].lang,
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
                                this.firestore.doc(`/subs/${params.imdbid}`)
                                    .set({subs: result});
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