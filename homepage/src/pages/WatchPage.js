import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
import { BasicLayout } from '../components';

class WatchPage extends Component {
  render() {
    return (
      <BasicLayout title="Watch Movie">
        <div>
          <Video
            src={`/data/${this.props.match.params.id}`}
            autoPlay
            controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
          />
        </div>
      </BasicLayout>
    );
  }
}

export default WatchPage;
