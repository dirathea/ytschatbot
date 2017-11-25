import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';

class WatchPage extends Component {
  render() {
    return (
      <div>
        <Video
          src={`/data/${this.props.match.params.id}`}
          autoPlay
          controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
          >
        </Video>
      </div>
    );
  }
}

export default WatchPage;
