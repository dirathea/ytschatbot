import React, { Component } from 'react';
import { ControlBar, Player, BigPlayButton } from 'video-react';

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
          <BigPlayButton position="center" style={{display: 'none'}}/>
        </Player>
      </div>
    );
  }
}

export default WatchPage;
