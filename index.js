/**
 * Created by aldiraraharja on 1/15/17.
 */
const express = require('express');
const LineClient = require('@line/bot-sdk').Client;
const middleware = require('@line/bot-sdk').middleware;
const path = require('path');
const config = require('./config');
const YTSClient = require('./yts_client/yts-client');
const LineHandler = require('./line/handler');
const FirebaseClient = require('./firebase_client');
const Torrent = require('./torrent');

const torrentClient = new Torrent();

const app = express();
const lineConfig = {
  channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
};

const client = new LineClient(lineConfig);
const ystClient = new YTSClient(config.YTS_BASE_URL);
const firebaseClient = new FirebaseClient()
const handler = new LineHandler(client, ystClient, firebaseClient);

app.use(express.static(path.resolve(__dirname, 'homepage', 'build')));

app.use('/line', middleware(lineConfig), (req, res) => {
  handler.handleRequest(req.body);
  return res.sendStatus(200);
});

app.use('/data/:id', torrentClient.serveFile);

app.get('*', (req, res) => {
  return res.sendFile(path.resolve(__dirname, 'homepage', 'build', 'index.html'));
})

app.listen(process.env.PORT || 8080, () => {
  console.log('Bot is up!');
});
