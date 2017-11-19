const _ = require('lodash');
const qs = require('query-string');
const mustache = require('mustache');
const messages = require('./messages');

const handleError = (err) => {
    console.error(JSON.stringify(err.originalError.response.data));
}

const MOVIE_DETAIL_TEMPLATE = `{{title_long}}
Casts : {{casts}}
Rating : {{rating}}

{{description_full}}
`;

const MOVIE_MORE_TEXT = `{{year}}
{{genres}}
{{mpa_rating}}`

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
            
            case 'postback':
                this.handlePostbackEvent(event);
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
                                text: `Sorry, ${term} is not found on our database`,
                            })
                            .catch(handleError)
                        };

                        const carrouselMessage = result.movies.map(movie => {
                            const actions = [
                                {
                                    type: 'uri',
                                    label: 'Watch Trailer',
                                    uri: `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`
                                },
                                {
                                    type: 'postback',
                                    label: 'Details',
                                    data: qs.stringify({
                                        keyword: 'movie-detail',
                                        data: movie.id
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

    handlePostbackEvent(event) {
        const postbackData = event.postback.data;
        this.handlePostback(event.replyToken, event.source, postbackData);
    }

    handlePostback(replyToken, source, data) {
        const parsedData = qs.parse(data);
        switch (parsedData.keyword) {
            case 'movie-detail':
                this.ytsClient.getMovie(parsedData.data)
                    .then(result => {
                        const movie = result.movie;
                        const movieImageMessage = messages.imageMessage(movie.large_cover_image, movie.small_cover_image);
                        const movieDetailTextMessage = messages.textMessage(mustache.render(MOVIE_DETAIL_TEMPLATE, {
                            title_long: movie.title_long,
                            casts: (movie.cast || []).map(cast => cast.name).join(', '),
                            rating: movie.rating,
                            description_full: movie.description_full
                        }));
                        const watchAction = messages.actionUriTemplate("Watch Now", movie.url);
                        const similarAction = messages.actionPostbackTemplate("Simillar", qs.stringify({
                            keyword: 'suggestion',
                            data: movie.id,
                        }));
                        const buttonMessage = messages.buttonTemplate(undefined, movie.title, mustache.render(MOVIE_MORE_TEXT, {
                            year: movie.year,
                            genres: (movie.genres || []).join(', '),
                            mpa_rating: movie.mpa_rating
                        }), [watchAction, similarAction]);

                        this.lineClient.replyMessage(replyToken, [movieImageMessage, movieDetailTextMessage, buttonMessage]);
                    })
                    .catch(handleError)
                break;
        
            default:
                break;
        }
    }
}

module.exports = Handler;