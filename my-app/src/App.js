import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

// configuring Amplify with resources from .env 
Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
    cookieStorage: {
      path: '/',
      expires: '',
      domain: window.location.hostname,
      secure: true,
    },
    oauth: {
      domain: process.env.REACT_APP_USER_POOL_AUTH_DOMAIN,
      scope: process.env.REACT_APP_USER_POOL_SCOPES.split(','),
      redirectSignIn: `https://${window.location.hostname}${process.env.REACT_APP_USER_POOL_REDIRECT_PATH_SIGN_IN}`,
      redirectSignOut: `https://${window.location.hostname}${process.env.REACT_APP_USER_POOL_REDIRECT_PATH_SIGN_OUT}`,
      responseType: 'code'
    }
  }
});

const decodeToken = (token) => {
  const tokenBody = token.split('.')[1];
  const decodableTokenBody = tokenBody.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(decodableTokenBody));
}

const App = () => {
  const [state, setState] = useState({
    email: undefined,
    username: undefined,
  });

  useEffect(() => {

    Auth.currentSession()
      .then(user => setState({
        username: user.username,
        email: decodeToken(user.getIdToken().getJwtToken()).email,
      }));

    // Schedule check and refresh (when needed) of JWT's every 5 min:
    const i = setInterval(() => Auth.currentSession(), 5 * 60 * 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Hi Andy! Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
