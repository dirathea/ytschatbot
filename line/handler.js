const _ = require('lodash');
const qa = require('query-string')

class Handler {
    constructor(lineClient, ytsClient) {
        this.lineClient = lineClient;
        this.ytsClient = ytsClient;
    }

    handleRequest(payload) {
        payload.events.forEach(event => {
            this.handleEvent(event);
        });
    }

    handleEvent(event) {
        const type = event.type;
        switch (type) {
            case 'message':
                this.handleMessageEvent(event);
                break;
        
            default:
                console.log(`Unknown type ${type}`);
                break;
        }
    }

    handleMessageEvent(event) {
        const type = event.message.type;
        switch (type) {
            case 'text':
                this.handleTextMessage(event.replyToken, event.source, event.message.text);
                break;
        
            default:
                console.log(`unhandled message type ${type}`);
                break;
        }
    }

    handleTextMessage(replyToken, source, text) {
        const token = text.split(' ');
        const keyword = token[0].toLowerCase();
        const term = token.slice(1, token.length).join(' ');
        switch (keyword) {
            case 'search':
                this.ytsClient.searchMovie(term)
                    .then(result => {
                        const carrouselMessage = result.movies.map(movie => {
                            const actions = [
                                {
                                    type: 'uri',
                                    label: 'trailer',
                                    uri: `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`
                                },
                                {
                                    type: 'postback',
                                    label: 'Details',
                                    data: qa.stringify({
                                        keyword: 'movie-detail',
                                        data: {
                                            id: movie.id
                                        }
                                    })
                                }
                            ]
                            return {
                                thumbnailImageUrl: movie.large_cover_image,
                                title: movie.title,
                                text: _.truncate(movie.summary, {length: 50, separator: /\W/}),
                                actions,
                            }
                        });

                        this.lineClient.replyMessage(replyToken, {
                            type: 'template',
                            altText: `Search result for ${term}`,
                            template: carrouselMessage
                        }).catch(err => {
                            console.log(JSON.stringify(err.originalError.response.data));
                        })
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
            default:
                console.log(`unknown keyword ${keyword}`);
                break;
        }
    }
}

module.exports = Handler;