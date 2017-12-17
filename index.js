/**
 * Created by aldiraraharja on 1/15/17.
 */
const express = require('express');
const LineClient = require('@line/bot-sdk').Client;
const middleware = require('@line/bot-sdk').middleware;
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const config = require('./config');
const YTSClient = require('./yts_client/yts-client');
const LineHandler = require('./line/handler');
const FirebaseClient = require('./firebase_client');
const Torrent = require('./torrent/Torrent');
const OSClient = require('./opensubs_client');
const SeriesClient = require('./oneom_client/oneom_client');

const torrentClient = new Torrent();
const osClient = new OSClient();

const app = express();
const lineConfig = {
  channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
};

const lineClient = new LineClient(lineConfig);
const ystClient = new YTSClient(config.YTS_BASE_URL);
const firebaseClient = new FirebaseClient();
const serialClient = new SeriesClient(config.SERIES_BASE_URL);
const handler = new LineHandler(
  {
    lineClient,
    ystClient,
    firebaseClient,
    osClient,
    serialClient
  });

app.use(express.static(path.resolve(__dirname, 'homepage', 'build')));

app.use('/line', middleware(lineConfig), (req, res) => {
  handler.handleRequest(req.body);
  return res.sendStatus(200);
});

app.use('/data/:id', torrentClient.serveFile);
app.use('/subs/:id', (req, res) => {
  firebaseClient
    .getFirestore()
    .doc(`session/${req.params.id}`)
    .get()
    .then(snapshot => {
      const subsLink = snapshot.data().subs;
      console.log(`requesting ${subsLink}`);
      axios
        .get(subsLink, { responseType: 'arraybuffer' })
        .then(response => {
          res.send(response.data);
        })
        .catch(err => {
          res.send(err);
        });
    });
});

app.get('*', (req, res) => {
  return res.sendFile(
    path.resolve(__dirname, 'homepage', 'build', 'index.html')
  );
});

app.listen(process.env.PORT || 8080, () => {
  console.log('Bot is up!');
});
