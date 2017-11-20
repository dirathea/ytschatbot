import React, { Component } from 'react';

class WatchPage extends Component {
  state = {
    hash : 'magnet:?xt=urn:btih:6A88FB0181448B86465D12737931DF825F60A2A0&dn=Cars+3+%282017%29+%5B720p%5D+%5BYTS.AG%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337'
  }

  constructor(props) {
    super(props);
    this.client = new window.WebTorrent();
  }

  componentDidMount() {
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

    this.client.on('error', err => {
        this.setState({err});
    });
  }

  render() {
    return (
      <div>
        Grab your popcorn and watch {this.props.match.params.hash}
        <div id="torrent" />
      </div>
    );
  }
}

export default WatchPage;
