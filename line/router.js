/**
 * Created by aldiraraharja on 1/15/17.
 */
'use strict';
const express = require('express');
const router = express.Router();
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || 'invalidChannelSecret';
const LineParser = require('./parser');
const lineParser = new LineParser(LINE_CHANNEL_SECRET);

router.post('/', (request, response) => {
    const messageSignature = request.get('X-Line-Signature');
    if (request.body && messageSignature) {
        lineParser.handle(request.body, messageSignature);
    }
    response.sendStatus(200);
});

module.exports = router;