/**
 * Created by aldiraraharja on 1/15/17.
 */
const express = require('express');
const LineClient = require('@line/bot-sdk').Client;
const middleware = require('@line/bot-sdk').middleware;
const config = require('./config');
const YTSClient = require('./yts_client/yts-client');
const LineHandler = require('./line/handler');

const app = express();
const lineConfig = {
  channelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: config.LINE_CHANNEL_SECRET,
};

const client = new LineClient(lineConfig);
const ystClient = new YTSClient(config.YTS_BASE_URL);
const handler = new LineHandler(client, ystClient);

app.use('/line', middleware(lineConfig), (req, res) => {
  handler.handleRequest(req.body);
  return res.sendStatus(200);
});

app.listen(process.env.PORT || 8080, () => {
  console.log('Bot is up!');
});
