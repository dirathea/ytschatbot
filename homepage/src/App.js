import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from 'material-ui';
import * as firebase from 'firebase';
// Required for side-effects
import 'firebase/firestore';
import './App.css';
import HomePage from "./pages/HomePage";
import WatchPage from "./pages/WatchPage";

firebase.initializeApp({
  apiKey: 'AIzaSyCrpY3NGrNXzLfBUbjBYnfnNPEp5j_Q8Ng',
  authDomain: 'ytsbotindo.firebaseapp.com',
  projectId: 'ytsbotindo',
});

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Switch>
          <Route exact path="/watch/:id" component={WatchPage} />
          <Route component={HomePage} />
        </Switch>
      </MuiThemeProvider>
    );
  }
}

export default App;
