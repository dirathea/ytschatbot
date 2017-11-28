import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
import { BasicLayout } from '../components';
import * as firebase from 'firebase';
import 'firebase/firestore';

class WatchPage extends Component {
  state = {
    subsUrl: null,
    title: 'Watch Movie',
  };

  componentDidMount() {
    const firestore = firebase.firestore();
    firestore
      .doc(`/session/${this.props.match.params.id}`)
      .get()
      .then(snapshot => {
        const movieData = snapshot.data();
        this.setState({
          subsUrl: movieData.subs,
          title: movieData.title,
        });
      });
  }
  render() {
    return (
      <BasicLayout title={this.state.title}>
        <div>
          <Video
            src={`/data/${this.props.match.params.id}`}
            autoPlay
            crossOrigin="anonymous"
            controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen', 'Captions']}>
            <track
              label="English"
              kind="subtitles"
              srcLang="en"
              src={this.state.subsUrl}
              default
            />
          </Video>
        </div>
      </BasicLayout>
    );
  }
}

export default WatchPage;
