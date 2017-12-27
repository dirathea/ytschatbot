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
const bodyParser = require('body-parser');
const proxy = require('http-proxy-middleware');
const config = require('./config');
const YTSClient = require('./yts_client/yts-client');
const LineHandler = require('./line/handler');
const FirebaseClient = require('./firebase_client');
const Torrent = require('./torrent/Torrent');
const OSClient = require('./opensubs_client');
const SeriesClient = require('./oneom_client/oneom_client');
const LoadBalancer = require('./load_balancer/load_balancer');

const app = express();
const lineConfig = {
  channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
};

const lineClient = new LineClient(lineConfig);
const ytsClient = new YTSClient(config.YTS_BASE_URL);
const firebaseClient = new FirebaseClient();
const loadBalancerClient = new LoadBalancer(firebaseClient);
const torrentClient = new Torrent(loadBalancerClient);
const osClient = new OSClient();
const serialClient = new SeriesClient(config.SERIES_BASE_URL);
const handler = new LineHandler(
  {
    lineClient,
    ytsClient,
    firebaseClient,
    osClient,
    serialClient,
    loadBalancerClient
  });

app.use(express.static(path.resolve(__dirname, 'homepage', 'build')));

app.use('/line', middleware(lineConfig), (req, res) => {
  handler.handleRequest(req.body);
  return res.sendStatus(200);
});

app.post('/add', bodyParser.json(),(req, res) => {
  const torrentRequest = req.body;
  torrentClient.addNewTorrent(
    torrentRequest.sessionId,
    torrentRequest.torrentFile,
    torrentRequest.custom
  );
  res.sendStatus(200);
});

const proxyOptions = {
  target: config.BASE_URL,
  changeOrigin: true,
  router: req => {
    const url = loadBalancerClient.getFileUrl(req.params.id);
    console.log(`session ${req.params.id} is served from ${url}`);
    return url;
  }
}

app.use('/data/:id', config.FEEDER_MODE ? proxy(proxyOptions) : torrentClient.serveFile);
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
  if (!config.FEEDER) {
    handler.startCronJob();
  }
});
