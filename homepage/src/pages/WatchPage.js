import React, { Component } from 'react';

class WatchPage extends Component {
  state = {
    hash : 'magnet:?xt=urn:btih:6832C73CEE9E4F5F430ACE96CE2442A213EB11B1&dn=Cars+3+%282017%29+%5B1080p%5D+%5BYTS.AG%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com'
  }

  constructor(props) {
    super(props);
    this.client = new window.WebTorrent();
  }

  componentDidMount() {
    this.client.on('error', err => {
        this.setState({err});
    });
  }

  render() {
    this.client.add(this.state.hash,
      torrent => {
        console.log('torrent');
        // Torrents can contain many files. Let's use the .mp4 file
        var file = torrent.files.find(function(file) {
          return file.name.endsWith('.mp4');
        });
        file.appendTo('#torrent');
      }
    );
    return (
      <div>
        Grab your popcorn and watch {this.props.match.params.hash}
        <div id="torrent" />
      </div>
    );
  }
}

export default WatchPage;
