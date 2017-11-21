import React, { Component } from 'react';
import * as firebase from "firebase";
const trackers = ['wss://tracker.btorrent.xyz', 'wss://tracker.openwebtorrent.com', 'wss://tracker.fastcast.nz']

const rtcConfig = {
  'iceServers': [
    {
      'urls': 'stun:stun.l.google.com:19305'
    }
  ]
}

const torrentOpts = {
  announce: trackers
}

const trackerOpts = {
  announce: trackers,
  rtcConfig: rtcConfig
}

class WatchPage extends Component {
  state = {
    hash : 'magnet:?xt=urn:btih:79C0CB48CD77946FC20AEA3B9F80DE605FD7A06C&dn=The+Hitman%27s+Bodyguard+%282017%29+%5B720p%5D+%5BYTS.AG%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337'
  }

  constructor(props) {
    super(props);
    this.client = new window.WebTorrent({
      tracker: trackerOpts
    });
    this.db = firebase.firestore();
  }

  componentDidMount() {
    this.client.on('error', err => {
        this.setState({err});
    });
    this.db.doc(`session/${this.props.match.params.hash}`).get().then(snapshot => {
      this.client.add(snapshot.data().magnetUrl, torrentOpts,
        torrent => {
          console.log('torrent');
          // Torrents can contain many files. Let's use the .mp4 file
          var file = torrent.files.find(function(file) {
            return file.name.endsWith('.mp4');
          });
          file.appendTo('#torrent');
        }
      );
    });
  }

  render() {
    return (
      <div>
        <div id="torrent" />
      </div>
    );
  }
}

export default WatchPage;
