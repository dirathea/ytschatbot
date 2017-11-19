import React, { Component } from 'react';
import WebTorrent from 'webtorrent';

class WatchPage extends Component {
    constructor(props) {
        super(props);
        this.client = new WebTorrent();
        const hash = props.match.params.hash;
        console.log(`load torrent ${hash}`)
        this.client.add(hash, torrent => {
            console.log('torrent');
          torrent.files.forEach(function(file) {
            // Display the file by appending it to the DOM. Supports video, audio, images, and
            // more. Specify a container element (CSS selector or reference to DOM node).
            file.appendTo('#torrent');
          });
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
