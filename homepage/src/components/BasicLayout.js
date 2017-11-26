import React, { Component } from 'react';
import { AppBar, Toolbar, Typography } from 'material-ui';

const styles = {
    main: {
        height: '100vh',
    },
    content: {
        background: 'black',
        height: '100vh'
    }
}

class BasicLayout extends Component {
  render() {
    return (
      <div style={styles.main}>
        <AppBar position="static">
          <Toolbar>
            <Typography type="title">{this.props.title}</Typography>
            <span style={{ flex: 1 }} />
            <Typography type="subheading">Share</Typography>
          </Toolbar>
        </AppBar>
        <div style={styles.content}>
        {this.props.children}
        </div>
      </div>
    );
  }
}

export default BasicLayout;
