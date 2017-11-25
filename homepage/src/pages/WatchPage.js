import React, { Component } from 'react';
import { ControlBar, Player } from 'video-react';

class WatchPage extends Component {
  render() {
    return (
      <div>
        <Player
          style={{
            width: '100vw',
            height: '100vh',
          }}
          src={`/data/${this.props.match.params.id}`}
          autoPlay
          fluid
          playsInline>
          <ControlBar autoHide={true} />
        </Player>
      </div>
    );
  }
}

export default WatchPage;
