import React, { Component } from 'react';
import { ControlBar, Player } from "video-react";

class WatchPage extends Component {
  render() {
    return (
      <div>
        <Player
          src={`/data/${this.props.match.params.id}`}
          fluid
          playsInline>
          <ControlBar autoHide={false} />
          </Player>
      </div>
    );
  }
}

export default WatchPage;
