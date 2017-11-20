import React, { Component } from 'react';

class WatchPage extends Component {
  state = {
    hash : 'magnet:?xt=urn:btih:6832C73CEE9E4F5F430ACE96CE2442A213EB11B1&dn=Cars+3+%282017%29+%5B1080p%5D+%5BYTS.AG%5D'
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
    this.client.add(`magnet:?${this.props.match.params.hash}`,
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
