const _ = require('lodash');
const qs = require('query-string');
const mustache = require('mustache');
const messages = require('./messages');

const handleError = err => {
  console.error(JSON.stringify(err.originalError.response.data));
};

const MOVIE_DETAIL_TEMPLATE = `{{title_long}}
Casts : {{casts}}
Rating : {{rating}}

{{{description_full}}}
`;

const MOVIE_MORE_TEXT = `{{year}}
{{genres}}
{{mpa_rating}}`;

class Handler {
  constructor(lineClient, ytsClient, firebaseClient) {
    this.lineClient = lineClient;
    this.ytsClient = ytsClient;
    this.firebaseClient = firebaseClient;
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
        this.handleTextMessage(
          event.replyToken,
          event.source,
          event.message.text
        );
        break;

      default:
        console.log(`unhandled message type ${type}`);
        break;
    }
  }

  sendMovieList(replyToken, result) {
    if (result.movie_count == 0) {
      return this.lineClient
        .replyMessage(
          replyToken,
          messages.textMessage(`Empty result from database`)
        )
        .catch(handleError);
    }

    const carouselMessage = result.movies.map(movie => {
      const actions = [
        messages.actionUriTemplate(
          'Watch Trailer',
          `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`
        ),
        messages.actionPostbackTemplate(
          'Details',
          qs.stringify({
            keyword: 'movie-detail',
            data: movie.id,
          })
        ),
      ];
      return messages.carouselColumnTemplate(
        movie.large_cover_image,
        movie.title,
        _.truncate(movie.summary, { length: 50, separator: /\W/ }),
        actions
      );
    });

    const message = messages.templateMessage(
      `Search result`,
      messages.carouselTemplate(carouselMessage)
    );
    return this.lineClient.replyMessage(replyToken, message).catch(handleError);
  }

  handleTextMessage(replyToken, source, text) {
    const token = text.split(' ');
    const keyword = token[0].toLowerCase();
    const term = token.slice(1, token.length).join(' ');
    switch (keyword) {
      case 'search':
        this.ytsClient
          .searchMovie(term)
          .then(result => {
            return this.sendMovieList(replyToken, result);
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
        this.ytsClient
          .getMovie(parsedData.data)
          .then(result => {
            const movie = result.movie;
            const movieImageMessage = messages.imageMessage(
              movie.large_cover_image,
              movie.medium_cover_image
            );
            const movieDetailTextMessage = messages.textMessage(
              mustache.render(MOVIE_DETAIL_TEMPLATE, {
                title_long: movie.title_long,
                casts: (movie.cast || []).map(cast => cast.name).join(', '),
                rating: movie.rating,
                description_full: movie.description_full,
              })
            );
            const watchActions = movie.torrents.slice(0, 3).map(torr => {
              return messages.actionPostbackTemplate(
                `Watch in ${torr.quality}`,
                qs.stringify({
                  keyword: 'watchlink',
                  movie: torr.url,
                  title: `${movie.title} (${torr.quality})`
                })
              );
            });

            const similarAction = messages.actionPostbackTemplate(
              'Simillar',
              qs.stringify({
                keyword: 'suggestion',
                data: movie.id,
              })
            );
            watchActions.push(similarAction);

            const buttonTemplate = messages.buttonTemplate(
              undefined,
              movie.title,
              mustache.render(MOVIE_MORE_TEXT, {
                year: movie.year,
                genres: (movie.genres || []).join(', '),
                mpa_rating: movie.mpa_rating,
              }),
              watchActions
            );

            const buttonMessage = messages.templateMessage(
              `${movie.title} options`,
              buttonTemplate
            );
            this.lineClient
              .replyMessage(replyToken, [
                movieImageMessage,
                movieDetailTextMessage,
                buttonMessage,
              ])
              .catch(handleError);
          })
          .catch(handleError);
        break;

      case 'suggestion':
        this.ytsClient.getSuggestions(parsedData.data).then(result => {
          return this.sendMovieList(replyToken, result);
        });
        break;
      
        case 'watchlink':
        this.firebaseClient.addWatchSession(source.userId, parsedData.movie)
          .then(result => {
            this.firebaseClient.getFirestore().doc(`/session/${result.id}`)
              .onSnapshot(doc => {
                if (doc.data().status === 'ready') {
                  const sessionData = doc.data();
                  this.lineClient.pushMessage(sessionData.userId, messages.textMessage(result.url));
                };
              });
          });
          this.lineClient.replyMessage(replyToken, messages.textMessage(`Preparing ${parsedData.title}`));
        break;
      default:
        break;
    }
  }
}

module.exports = Handler;
