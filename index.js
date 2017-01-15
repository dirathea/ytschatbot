/**
 * Created by aldiraraharja on 1/15/17.
 */
const express = require('express');
const bodyParser = require('body-parser');
const lineApp = require('./line/router');

const app = express();

app.use(bodyParser.json());

app.use('/line', lineApp);

app.listen(process.env.PORT || 8080, () => {
    console.log('Bot is up!');
});