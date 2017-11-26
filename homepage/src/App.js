import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import * as firebase from "firebase";
// Required for side-effects
import "firebase/firestore";
import logo from './logo.svg';
import './App.css';
import WatchPage from "./pages/WatchPage";

firebase.initializeApp({
  apiKey: 'AIzaSyCrpY3NGrNXzLfBUbjBYnfnNPEp5j_Q8Ng',
  authDomain: 'ytsbotindo.firebaseapp.com',
  projectId: 'ytsbotindo'
});

class App extends Component {
  render() {
    return (
        <Switch>
          <Route exact path="/watch/:id" component={WatchPage}>
          </Route>
          <Route
            render={() => {
              return (
                <div className="App">
                  <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                  </header>
                  <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to
                    reload.
                  </p>
                </div>
              );
            }}
          />
        </Switch>
    );
  }
}

export default App;
