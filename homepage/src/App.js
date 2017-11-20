import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import WatchPage from "./pages/WatchPage";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/watch/:hash" component={WatchPage}>
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
      </BrowserRouter>
    );
  }
}

export default App;