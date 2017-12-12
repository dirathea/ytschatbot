/**
 * Created by aldiraraharja on 1/15/17.
 */
const express = require('express');
const LineClient = require('@line/bot-sdk').Client;
const middleware = require('@line/bot-sdk').middleware;
const path = require('path');
const axios = require('axios');
const config = require('./config');
const YTSClient = require('./yts_client/yts-client');
const LineHandler = require('./line/handler');
const FirebaseClient = require('./firebase_client');
const Torrent = require('./torrent/Torrent');
const OSClient = require('./opensubs_client');
const react = require('react');
const reactServer = require('react-dom/server');
const homepageApp = require('./homepage/src/App');

const torrentClient = new Torrent();
const osClient = new OSClient();

const app = express();
const lineConfig = {
  channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
};

const client = new LineClient(lineConfig);
const ystClient = new YTSClient(config.YTS_BASE_URL);
const firebaseClient = new FirebaseClient()
const handler = new LineHandler(client, ystClient, firebaseClient, osClient);

app.use(express.static(path.resolve(__dirname, 'homepage', 'build')));

app.use('/line', middleware(lineConfig), (req, res) => {
  handler.handleRequest(req.body);
  return res.sendStatus(200);
});

app.use('/data/:id', torrentClient.serveFile);
app.use('/subs/:id', (req, res) => {
  firebaseClient.getFirestore()
    .doc(`session/${req.params.id}`)
    .get()
    .then(snapshot => {
      const subsLink = snapshot.data().subs;
      console.log(`requesting ${subsLink}`);
      axios.get(subsLink, {responseType: 'arraybuffer'})
        .then(response => {
          res.send(response.data);
        })
        .catch(err => {
          res.send(err);
        });
    });
});

app.get('*', (req, res) => {
  const ssr = reactServer.renderToString(react.createElement(homepageApp));
  return res.send(`
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="theme-color" content="#000000">
    <meta name="propeller" content="5ec466a460c8ef6d317039e530520417" />
    <!--
        manifest.json provides metadata used when your web app is added to the
        homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
      -->
    <meta property="og:title" content="Watch HD Movies from chatbot" />
    <meta property="og:url" content="https://ytsmoviebot.herokuapp.com/" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    <link rel="stylesheet" href="https://video-react.js.org/assets/video-react.css" />
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-110194612-1"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
  
      gtag('config', 'UA-110194612-1');
    </script>
    <title>YTS Watch</title>
  </head>
  
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    ${ssr}
    <script src="https://d.line-scdn.net/r/web/social-plugin/js/thirdparty/loader.min.js" async="async" defer="defer"></script>
    <script async="async" type="text/javascript" src="//go.mobisla.com/notice.php?p=1485033&interactive=1&pushup=1"></script>
  </body>
  
  </html>
  `);
  // return res.sendFile(path.resolve(__dirname, 'homepage', 'build', 'index.html'));
})

app.listen(process.env.PORT || 8080, () => {
  console.log('Bot is up!');
});