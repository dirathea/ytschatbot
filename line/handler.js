const _ = require('lodash');
const qs = require('query-string');
const mustache = require('mustache');
const Vibrant = require('node-vibrant');
const stripTags = require('striptags');
const magnetUri = require('magnet-uri');

const messages = require('./messages');

const handleError = err => {
  console.error(JSON.stringify(err.originalError.response.data));
};

const MOVIE_DETAIL_TEMPLATE = `{{title_long}}
Casts : {{casts}}
Rating : {{rating}}
Genre: {{genre}}

{{{description_full}}}
`;

const MOVIE_MORE_TEXT = `{{year}}
Duration : {{duration}} minutes
{{mpa_rating}}`;

class Handler {
  constructor(clients) {
    this.lineClient = clients.lineClient;
    this.ytsClient = clients.ytsClient;
    this.firebaseClient = clients.firebaseClient;
    this.osClient = clients.osClient;
    this.serialClient = clients.serialClient;
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

      case 'follow':
        this.handleFollowEvent(event);
        break;

      default:
        console.log(`Unknown type ${type}`);
        break;
    }
  }

  handleFollowEvent(event) {
    this.lineClient.getProfile(event.source.userId).then(profile => {
      this.firebaseClient.addUser(profile);
      const greetingMessage = `Hello ${
        profile.displayName
      }! My name is YTS Bot. Chat bot to help you search and stream HD movies directly on your chat app.
Try typing "search <your movie title>" to getting started.

Happy watching!`;
      this.lineClient.replyMessage(
        event.replyToken,
        messages.textMessage(greetingMessage)
      );
    });
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
          'Watch Now',
          qs.stringify({
            keyword: 'movie-detail',
            data: movie.id,
          })
        ),
        messages.actionPostbackTemplate(
          'Simillar',
          qs.stringify({
            keyword: 'suggestion',
            data: movie.id,
          })
        ),
      ];
      const backgroundPalettePromise = Vibrant.from(movie.large_cover_image)
        .getPalette()
        .then(palette => {
          return Promise.resolve(palette.Vibrant.getHex());
        })
        .catch(err => {
          return Promise.resolve();
        });
      return backgroundPalettePromise.then(background => {
        return messages.carouselColumnTemplate(
          movie.large_cover_image,
          _.truncate(movie.title, { length: 35, separator: /\W/ }),
          _.truncate(movie.summary, { length: 50, separator: /\W/ }),
          actions,
          background
        );
      });
    });

    return Promise.all(carouselMessage).then(carouselColumns => {
      console.log(JSON.stringify(carouselColumns));
      const message = messages.templateMessage(
        `Search result`,
        messages.carouselTemplate(carouselColumns, 'rectangle', 'contain')
      );
      return this.lineClient
        .replyMessage(replyToken, message)
        .catch(handleError);
    });
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
      case 'link':
        this.processTorrent(replyToken, source, {
          movie: term,
          image: '',
          title: term,
          qty: '',
          custom: true,
        });
        break;
      case 'series':
        this.serialClient.searchSeries(term).then(result => {
          return this.sendSeriesList(replyToken, result);
        });
        break;
      default:
        console.log(`unknown keyword ${keyword}`);
        break;
    }
  }

  sendSeriesList(replyToken, result) {
    const seriesList = _.slice(
      _.orderBy(result.serials, ['imdb_rating'], ['desc']),
      0,
      10
    ).map(serial => {
      const actionDetails = messages.actionPostbackTemplate(
        'Details',
        qs.stringify({ keyword: 'series-detail', id: serial.id })
      );
      const actionSubscribe = messages.actionPostbackTemplate(
        'Subscribe',
        qs.stringify({ keyword: 'series-subscribe', id: serial.id })
      );
      const actions = [actionDetails, actionSubscribe];
      const schedule =
        serial.airday && serial.airtime
          ? `every ${serial.airday} on ${serial.airtime}`
          : 'Ended';

      const mainText = `${serial.start} - ${serial.end}\n${schedule}`;

      const mainImage = serial.poster_id
        ? this.serialClient.getImageUrl(serial.poster.name)
        : 'https://yts.am/assets/images/website/logo-YTS.svg';

      const backgroundPalettePromise = Vibrant.from(mainImage)
        .getPalette()
        .then(palette => {
          return Promise.resolve(palette.Vibrant.getHex());
        })
        .catch(err => {
          return Promise.resolve();
        });
      return backgroundPalettePromise.then(background => {
        return messages.carouselColumnTemplate(
          mainImage,
          _.truncate(serial.title, { length: 35, separator: /\W/ }),
          _.truncate(mainText, { length: 50, separator: /\W/ }),
          actions,
          background
        );
      });
    });

    return Promise.all(seriesList).then(carouselColumns => {
      console.log(JSON.stringify(carouselColumns));
      const message = messages.templateMessage(
        `Search result`,
        messages.carouselTemplate(carouselColumns, 'rectangle', 'contain')
      );
      return this.lineClient
        .replyMessage(replyToken, message)
        .catch(handleError);
    });
  }

  handlePostbackEvent(event) {
    const postbackData = event.postback.data;
    this.handlePostback(event.replyToken, event.source, postbackData);
  }

  processTorrent(replyToken, source, params) {
    console.log(params);
    const contentString = params.custom
      ? 'your torrent'
      : `${params.title} (${params.qty})`;
    this.firebaseClient.addWatchSession(source.userId, params).then(result => {
      const unsubscribe = this.firebaseClient
        .getFirestore()
        .doc(`/session/${result.id}`)
        .onSnapshot(doc => {
          if (doc.data().status === 'ready') {
            const sessionData = doc.data();
            unsubscribe();
            let osParams = {};
            if (params.custom) {
              osParams = Object.assign(osParams, {
                filename: doc.data().title,
              });
            } else {
              osParams = Object.assign(osParams, {
                imdbid: params.imdb,
                filesize: params.size,
              });
            }
            this.osClient.getSubsLink(result.id, osParams).then(() => {
              this.lineClient.pushMessage(
                sessionData.userId,
                messages.textMessage(
                  `Watch ${contentString} here\n${result.url}`
                )
              );
            });
          }
        });
    });
    this.lineClient.replyMessage(
      replyToken,
      messages.textMessage(
        `Preparing ${contentString}...\nWe will notify you once the movie is ready`
      )
    );
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
                genre: (movie.genres || []).join(', '),
              })
            );
            const watchActions = movie.torrents.slice(0, 3).map(torr => {
              return messages.actionPostbackTemplate(
                `Watch in ${torr.quality}`,
                qs.stringify({
                  keyword: 'watchlink',
                  movieId: movie.id,
                  movie: torr.url,
                  qty: torr.quality,
                  size: torr.size_bytes,
                })
              );
            });

            const buttonTemplate = messages.buttonTemplate(
              undefined,
              movie.title,
              mustache.render(MOVIE_MORE_TEXT, {
                year: movie.year,
                duration: movie.runtime,
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
        this.ytsClient.getMovie(parsedData.movieId).then(result => {
          const movie = result.movie;
          const movieData = {
            movie: parsedData.movie,
            image: movie.large_cover_image,
            title: movie.title,
            qty: parsedData.qty,
            imdb: movie.imdb_code,
            size: parsedData.size,
          };
          this.processTorrent(replyToken, source, movieData);
        });
        break;
      case 'series-detail':
        this.serialClient.seriesDetails(parsedData.id).then(result =>
          this.sendSeriesDetails(replyToken, result.serial)
        );
        break;
      default:
        break;
    }
  }

  sendSeriesDetails(replyToken, series) {
    const seriesDetailMessages = [];
    if (series.poster_id) {
      seriesDetailMessages.push(
        messages.imageMessage(
          this.serialClient.getImageUrl(series.poster.name),
          this.serialClient.getImageUrl(series.poster.name)
        )
      );
    }
    const textDetails = [];
    if (series.genre) {
      const allGenre = series.genre.map(genre => genre.name).join(', ');
      textDetails.push(`Genre : ${allGenre}`);
    }
    if (series.network) {
      const allNetwork = series.network.map(network => network.name).join(', ');
      textDetails.push(`Network : ${allNetwork}`);
    }
    if (series.description.length > 0) {
      textDetails.push('',stripTags(series.description[0].body));
    }
    seriesDetailMessages.push(messages.textMessage(textDetails.join('\n')));
    const latestEpisode = [];
    let episodeIndex = series.ep.length - 1;
    while (latestEpisode.length < 10) {
      const currentEpi = series.ep[episodeIndex];
      if (currentEpi.torrent && currentEpi.torrent.length > 0) {
        const quality = {};
        _.orderBy(currentEpi.torrent, ['seed']).forEach(torr => {
          if (!quality[torr.quality.name]) {
            quality[torr.quality.name] = torr.value;
          }
        });
        const actions = _.slice(Object.keys(quality), 0, 3).map(qty => {
          const parsedMagnet = magnetUri.decode(quality[qty]);
          const trimmedUrlObject = Object.assign(parsedMagnet, {
            announce: [],
            tr: []
          });
          return messages.actionPostbackTemplate(
            `Watch in ${qty}`,
            qs.stringify({
              keyword: 'series-watch-link',
              id: series.id,
              url: magnetUri.encode(trimmedUrlObject),
            })
          );
        });
        const episodeButton = messages.carouselColumnTemplate(
          undefined,
          `S${currentEpi.season}·E${currentEpi.ep}`,
          currentEpi.title,
          actions
        );
        latestEpisode.push(episodeButton);
      }
      episodeIndex--;
    }
    const episodeCarrousel = messages.templateMessage(
      `Search result`,
      messages.carouselTemplate(latestEpisode, 'rectangle', 'contain')
    );
    seriesDetailMessages.push(episodeCarrousel);
    this.lineClient.replyMessage(replyToken, seriesDetailMessages).catch(handleError);
  }
}

module.exports = Handler;
