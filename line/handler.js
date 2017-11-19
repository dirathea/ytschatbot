const _ = require('lodash');
const qa = require('query-string')

const handleError = (err) => {
    console.error(JSON.stringify(err.originalError.response.data));
}

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
                        if (result.movie_count == 0) {
                            return this.lineClient.replyMessage(replyToken, {
                                type: 'text',
                                text: `Sorry, Search term ${term} is not found on our database`,
                            })
                            .catch(handleError)
                        };

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

                        const message = {
                            type: 'template',
                            altText: `Search result for ${term}`,
                            template: {
                                type: 'carousel',
                                columns: carrouselMessage
                            }
                        };

                        return this.lineClient.replyMessage(replyToken, message).catch(err => {
                            
                        })
                    })
                    .catch(handleError);
                break;
            default:
                console.log(`unknown keyword ${keyword}`);
                break;
        }
    }
}

module.exports = Handler;