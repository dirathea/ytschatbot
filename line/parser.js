/**
 * Created by aldiraraharja on 1/15/17.
 */
'use strict';

const utf8 = require('utf8');
const cryptography = require('crypto');
const _ = require('lodash');
const EventEmitter = require('events');

class LineParser extends EventEmitter {

    constructor(channelSecret) {
        super();
        this.channelSecret = channelSecret;
    }

    _validate(body, signature) {
        const generated_signature = cryptography.createHmac('sha256', this.channelSecret)
            .update(utf8.encode(JSON.stringify(body)))
            .digest('base64');
        return (signature === generated_signature);
    }

    static _getId(source) {
        switch (source.type) {
            case 'user':
                return source.userId;
            case 'group':
                return source.groupId;
            case 'room':
                return source.roomId;
        }
    }

    handle(body, signature) {
        const isMessageValid = this._validate(body, signature);
        if (isMessageValid) {
            _.forEach(body.events, (event) => {
                switch (event.type) {
                    case LineParser.EVENTS.MESSAGE:
                        const message = event.message;
                        const messageData = _.omit(message, 'type');
                        this.emit(message.type, event.replyToken, LineParser._getId(event.source), messageData);
                        break;
                    case LineParser.EVENTS.POSTBACK:
                        const postbackData = event.postback.data;
                        this.emit(LineParser.EVENTS.POSTBACK, event.replyToken, LineParser._getId(event.source), postbackData);
                        break;
                    case LineParser.EVENTS.BEACON:
                        const beacon = event.beacon;
                        const beaconData = _.omit(beacon, 'type');
                        this.emit(beacon.type, event.replyToken, LineParser._getId(event.source), beaconData);
                        break;
                    default:
                        this.emit(event.type, event.replyToken, LineParser._getId(event.source));
                        break;
                }
            });
        }
    }
}

LineParser.MESSAGE = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    LOCATION: 'location',
    STICKER: 'sticker',
};

LineParser.BEACON = {
    ENTER: 'enter',
    LEAVE: 'leave',
    BANNER: 'banner',
};

LineParser.EVENTS = {
    MESSAGE: 'message',
    POSTBACK: 'postback',
    FOLLOW: 'follow',
    UNFOLLOW: 'unfollow',
    JOIN: 'join',
    LEAVE: 'leave',
    BEACON: 'beacon',
};


module.exports = LineParser;