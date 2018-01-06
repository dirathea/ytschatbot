import React, { Component } from 'react';
import { BasicLayout } from '../components';
import { Grid, IconButton, Typography } from 'material-ui';
import { GridList, GridListTile, GridListTileBar } from 'material-ui/GridList';
import { PlayCircleOutline } from 'material-ui-icons';
import * as firebase from 'firebase';
import 'firebase/firestore';

const styles = {
  main: {
    maxWidth: '100vw',
    paddingLeft: '10vw',
    paddingRight: '10vw',
  },
  addButton: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
};

class HomePage extends Component {
  state = {};
  componentDidMount() {
    const firestore = firebase.firestore();
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() - 3);
    firestore
      .collection('session')
      .where('date', '>', expireDate.getTime())
      .where('status', '==', 'ready')
      .get()
      .then(snapshot => {
        const readyMovie = {};
        snapshot.forEach(movie => {
          const movieData = movie.data();
          if (!readyMovie[movieData.torrentUrl]) {
            readyMovie[movieData.torrentUrl] = {
              id: movie.id,
              image: movieData.image,
              title: movieData.title,
              url: movieData.url,
            };
          }
        });
        this.setState({ readyMovie });
      });
  }
  render() {
    return (
      <BasicLayout title="YTS Movie">
        <div style={styles.main}>
          <Grid container>
            <Grid item xs={12}>
              <Typography type="headline" align="center">
                Chat bot for Stream HD Quality Movie{' '}
                <a
                  href="https://line.me/R/ti/p/%40azc6953k"
                  style={styles.addButton}>
                  <img
                    height="36"
                    border="0"
                    alt="Tambah Teman"
                    src="https://scdn.line-apps.com/n/line_add_friends/btn/en.png"
                  />
                </a>
              </Typography>
            </Grid>
            <Grid item>
              <Typography type="title" gutterBottom>
                Currently Streamed :
              </Typography>
            </Grid>
          </Grid>
          <div style={{ width: '100%' }}>{this.renderReadyMovie()}</div>
        </div>
      </BasicLayout>
    );
  }

  renderReadyMovie() {
    if (!this.state.readyMovie) {
      return null;
    }
    const grid = Object.keys(this.state.readyMovie).map(url => {
      const movieData = this.state.readyMovie[url];
      return (
        <GridListTile key={`movie ${movieData.id}`}>
          <img src={movieData.image} alt={`cover ${movieData.title}`} />
          <GridListTileBar
            title={movieData.title}
            actionIcon={
              <a href={movieData.url || `/watch/${movieData.id}`}>
                <IconButton>
                  <PlayCircleOutline />
                </IconButton>
              </a>
            }
          />
        </GridListTile>
      );
    });

    return (
      <GridList cols={4} style={{ width: '100%' }}>
        {grid}
      </GridList>
    );
  }
}

export default HomePage;
