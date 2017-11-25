import React, { Component } from 'react';
import * as firebase from "firebase";

class WatchPage extends Component {
  state = {
    video : ''
  }

  constructor(props) {
    super(props);
    this.db = firebase.firestore();
  }

  componentDidMount() {
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
