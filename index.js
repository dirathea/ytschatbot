/**
 * Created by aldiraraharja on 1/15/17.
 */
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/line', (request, response) => {
    response.sendStatus(200);
});

app.listen(process.env.PORT || 8080, () => {
    console.log('Bot is up!');
});