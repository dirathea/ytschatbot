import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
import { BasicLayout } from '../components';
import * as firebase from 'firebase';
import 'firebase/firestore';

class WatchPage extends Component {
  state = {
    subsUrl: [],
    title: 'Watch Movie',
  };

  componentDidMount() {
    const firestore = firebase.firestore();
    firestore
      .doc(`/session/${this.props.match.params.id}`)
      .get()
      .then(snapshot => {
        const movieData = snapshot.data();
        const targetedLang = ['en', 'id'];
        const targetedSubs = movieData.subs.subs.reduce((prev, curr) => {
          if (targetedLang.indexOf(curr.lang) > -1) {
            return [...prev, curr];
          }
          return prev;
        }, []);
        this.setState({
          subsUrl: targetedSubs,
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
            controls={[
              'PlayPause',
              'Seek',
              'Time',
              'Volume',
              'Fullscreen',
              'Captions',
            ]}>
            {this.state.subsUrl.map(subs => (
              <track
                label={subs.langName}
                kind="subtitles"
                srcLang={subs.lang}
                src={subs.url}
                default={subs.lang === 'en'}
              />
            ))}
          </Video>
        </div>
      </BasicLayout>
    );
  }
}

export default WatchPage;
