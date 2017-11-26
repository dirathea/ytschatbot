import React, { Component } from 'react';
import { BasicLayout } from '../components';
import {
  Grid,
  IconButton,
  Typography,
} from 'material-ui';
import { GridList, GridListTile, GridListTileBar } from "material-ui/GridList";
import { PlayCircleOutline } from 'material-ui-icons';
import * as firebase from 'firebase';
import 'firebase/firestore';

class HomePage extends Component {
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
            };
          }
        });
        this.setState({ readyMovie });
      });
  }
  render() {
    return (
      <BasicLayout title="YTS Movie">
        <Grid container>
          <Grid item xs={12}>
            <Typography type="headline" align="center">
              Chat bot for Stream HD Quality Movie
            </Typography>
          </Grid>
          <Grid item>
            <Typography type="title">Currently Streamed</Typography>
          </Grid>
        </Grid>
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
        <GridListTile>
          <img src={movieData.image} />
          <GridListTileBar
            title={movieData.title}
            actionIcon={
              <IconButton>
                <PlayCircleOutline />
              </IconButton>
            }
          />
        </GridListTile>
      );
    });

    return <GridList>{grid}</GridList>;
  }
}

export default HomePage;
