import React, { Component } from 'react';
import * as firebase from "firebase";
const trackers = [
  'wss://tracker.btorrent.xyz',
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.fastcast.nz',
];

const torrentOpts = {
  announce: trackers
}

const trackerOpts = {
  announce: trackers
}

class WatchPage extends Component {
  state = {
    video : ''
  }

  constructor(props) {
    super(props);
    this.db = firebase.firestore();
  }

  componentDidMount() {
    this.client.on('error', err => {
        this.setState({err});
    });
    this.db.doc(`session/${this.props.match.params.id}`).get().then(snapshot => {
      this.setState({video: snapshot.id()});
    });
  }

  render() {
    return (
      <div>
        <video src={`/data/${this.state.video}`} />
      </div>
    );
  }
}

export default WatchPage;
