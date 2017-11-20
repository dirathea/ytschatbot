import React, { Component } from 'react';

class WatchPage extends Component {
  state = {
    hash : 'magnet:?xt=urn:btih:72A28A50B4AD7C969B1BCE259EC7284FE293A4B3&dn=Geostorm.2017.720p.KORSUB.HDRip.x264.AAC2.0-STUTTERSHIT%5Brarbg%5D&tr=udp%3A%2F%2F9.rarbg.me%3A2710%2Fannounce;tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce;tr=http%3A%2F%2Ftracker.trackerfix.com%3A80%2Fannounce'
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
