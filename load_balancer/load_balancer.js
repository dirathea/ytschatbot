const axios = require('axios');
const _ = require('lodash');
const serverMap = {};
const allServer = [];

class LoadBalancer {
    constructor(firebaseClient) {
        this.firebaseClient = firebaseClient;
        this.firebaseClient.getFirestore()
            .collection('servers')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    if (doc.data().ready) {
                        allServer.push(doc.data().url);
                    };
                });
            });
    }

    addNewTorrent(sessionId, torrentUrl, custom) {
        const serverUrl = _.sample(allServer);
        serverMap[sessionId] = serverUrl;

        return axios.post(`${serverUrl}/add`, {
            torrentFile: torrentUrl,
            sessionId,
            custom
        });
    }

    getFileUrl(sessionId) {
        return serverMap[sessionId];
    }
}

module.exports = LoadBalancer;