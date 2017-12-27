const Webtorrent = require('webtorrent');
const pump = require('pump');
const mime = require('mime');
const rangeParser = require('range-parser');
const admin = require("firebase-admin");
const config = require('../config');
const firestore = admin.firestore();
const _ = require('lodash');

const webtorrent = new Webtorrent();
        
webtorrent.on('error', err => {
  console.log(err);
});

const listTorrent = {}
const torrentOptions = {}
const defaultTracker = [
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.openbittorrent.com:80',
  'udp://tracker.coppersurfer.tk:6969',
  'udp://glotorrents.pw:6969/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://torrent.gresille.org:80/announce',
  'udp://p4p.arenabg.com:1337',
  'udp://tracker.leechers-paradise.org:6969',
]

// From https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function encodeRFC5987 (str) {
    return encodeURIComponent(str)
      // Note that although RFC3986 reserves "!", RFC5987 does not,
      // so we do not need to escape it
      .replace(/['()]/g, escape) // i.e., %27 %28 %29
      .replace(/\*/g, '%2A')
      // The following are not required for percent-encoding per RFC5987,
      // so we can allow for a little better readability over the wire: |`^
      .replace(/%(?:7C|60|5E)/g, unescape)
  }

class Torrent {
  
    constructor() {
      if (!config.FEEDER_MODE) {
        //  Server is running on monolith manner
        firestore.collection('session')
            .onSnapshot(snapshot => {
                snapshot.docChanges.forEach(change => {
                  const torrentUrl = change.doc.data().torrentUrl;
                  const limitDate = new Date();
                  limitDate.setHours(limitDate.getHours() - 3);
                  if (change.type === 'added') {
                    console.log(`session ${change.doc.id} added on ${change.doc.data().date} with limit ${limitDate.getTime()}`)
                    if (change.doc.data().date > limitDate.getTime()) {
                      this.addNewTorrent(change.doc.id, torrentUrl, change.doc.data().custom);
                    }
                  }
                });
            });
      }
        setInterval(this.expiredTorrent, 3600 * 1000);
    }

    expiredTorrent() {
      console.log(`Destroying old torrent`);
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours()-3);
      _.keys(listTorrent).forEach(url => {
        const torr = listTorrent[url];
        if (torr.date < expiredDate.getTime()) {
          //  torr is not accessed in last 3 hours
          torr.torrent.destroy(() => {
            console.log(`torrent ${url} is destroyed`);
            delete listTorrent[url];
          });
        }
      });
    }

    addNewTorrent(sessionId, torrentFile, custom) {
      if (listTorrent[torrentFile]) {
        return this.notifySessionReady(sessionId);
      }
      console.log(`adding ${torrentFile}`);
      try {
        webtorrent.add(torrentFile, { announce: defaultTracker},(torrent) => {
          console.log(`Torrent for ${sessionId} is available`);
          const date = new Date();
          listTorrent[torrentFile] = {
            torrent,
            date: date.getTime(),
          };
          const file = _.orderBy(torrent.files, ['length'], ['desc'])[0];
          console.log(`name : ${file.name}`);
          console.log(`size : ${file.length}`);
          this.notifySessionReady(sessionId, (custom) ? {title: file.name, size: file.length} : false);
      });
      } catch (e) {
        console.log(`Failed to add torrent ${torrentFile}`);
        console.log(e);
      }
    }

    notifySessionReady(sessionId, customUpdate) {
      let updateObject = {status: 'ready'};
      if (customUpdate) {
        updateObject = Object.assign(updateObject, customUpdate);
      }
      firestore.doc(`/session/${sessionId}`).update(updateObject).then(() => {
        console.log(`URL ${sessionId} is ready`);
      })
    }

    serveFile(req, res) {
        firestore.doc(`session/${req.params.id}`).get()
          .then(snapshot => {
            const sessionData = snapshot.data();
            if (!listTorrent[sessionData.torrentUrl]) {
              return res.sendStatus(404);
          }
            const currentTime = new Date();
            listTorrent[sessionData.torrentUrl].date = currentTime.getTime();
            const file = _.orderBy(listTorrent[sessionData.torrentUrl].torrent.files, ['length'], ['desc'])[0];
            res.statusCode = 200
            res.setHeader('Content-Type', mime.lookup(file.name))
      
            // Support range-requests
            res.setHeader('Accept-Ranges', 'bytes')
      
            // Set name of file (for "Save Page As..." dialog)
            res.setHeader(
              'Content-Disposition',
              'inline; filename*=UTF-8\'\'' + encodeRFC5987(file.name)
            )
      
            // Support DLNA streaming
            res.setHeader('transferMode.dlna.org', 'Streaming')
            res.setHeader(
              'contentFeatures.dlna.org',
              'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000'
            )
      
            // `rangeParser` returns an array of ranges, or an error code (number) if
            // there was an error parsing the range.
            var range = rangeParser(file.length, req.headers.range || '')
      
            if (Array.isArray(range)) {
              res.statusCode = 206 // indicates that range-request was understood
      
              // no support for multi-range request, just use the first range
              range = range[0]
      
              res.setHeader(
                'Content-Range',
                'bytes ' + range.start + '-' + range.end + '/' + file.length
              )
              res.setHeader('Content-Length', range.end - range.start + 1)
            } else {
              range = null
              res.setHeader('Content-Length', file.length)
            }
      
            if (req.method === 'HEAD') {
              return res.end()
            }
      
            pump(file.createReadStream(range), res)
          });
      }
}

module.exports = Torrent;