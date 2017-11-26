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
const Torrent = require('./torrent/Torrent');
const mustache = require('mustache');

//  SSR
import HomepageApp from "./homepage/src/App";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";

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
  const serverRender = renderToString((<StaticRouter location={req.url}>
    <HomepageApp />
  </StaticRouter>));
  return res.write(staticPage({
    body: serverRender
  }));
  // return res.sendFile(path.resolve(__dirname, 'homepage', 'build', 'index.html'));
})

app.listen(process.env.PORT || 8080, () => {
  console.log('Bot is up!');
});

function staticPage(params) {
  return mustache.render(`<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta name="theme-color" content="#000000">
      <!--
        manifest.json provides metadata used when your web app is added to the
        homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
      -->
      <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
      <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      <link rel="stylesheet" href="https://video-react.js.org/assets/video-react.css" />
      <!-- Global site tag (gtag.js) - Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=UA-110194612-1"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
  
        gtag('config', 'UA-110194612-1');
      </script>
      {{#meta}}
        {{#title}}
        <meta property="og:title" content="{{meta.title}}" />        
        {{/title}}
        {{#description}}
        <meta property="og:title" content="{{meta.description}}" />        
        {{/description}}
        {{#description}}
        <meta property="og:title" content="{{meta.description}}" />        
        {{/description}}
      {{/meta}}
      <title>{{{title}}}</title>
    </head>
    <body>
      <noscript>
        You need to enable JavaScript to run this app.
      </noscript>
      <div id="root">{{{body}}}</div>
      <script src="/bundle.js"></script>
    </body>
  </html>
  
  `, params);
}