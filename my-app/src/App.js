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
    // OPTIONAL - Amazon Cognito Web Client ID
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
    // OPTIONAL - Configuration for cookie storage
    // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
    cookieStorage: {
      // OPTIONAL - Cookie path
      path: '/',
      // OPTIONAL - Cookie expiration in days
      expires: '',
      // REQUIRED - Cookie domain (only required if cookieStorage is provided)
      domain: window.location.hostname,
      // OPTIONAL - Cookie secure flag
      // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
      secure: true,
    },
    // your Cognito Hosted UI configuration
    oauth: {
      // Domain name
      domain: process.env.REACT_APP_USER_POOL_AUTH_DOMAIN,
      // Authorized scopes
      scope: process.env.REACT_APP_USER_POOL_SCOPES.split(','),
      // Callback URL
      redirectSignIn: `https://${window.location.hostname}${process.env.REACT_APP_USER_POOL_REDIRECT_PATH_SIGN_IN}`,
      // Sign out URL
      redirectSignOut: `https://${window.location.hostname}${process.env.REACT_APP_USER_POOL_REDIRECT_PATH_SIGN_OUT}`,
      // 'code' for Authorization code grant, 
      // 'token' for Implicit grant
      // Note that REFRESH token will only be generated when the responseType is code
      responseType: 'code' 
    }
  }
});

const decodeToken = (token) => {
  // get payload portion [header . payload . signature]
  const base64Url = token.split('.')[1];
  // from base64url encoding to base64 
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // decode base64 encoded string
  return JSON.parse(window.atob(base64));
}

const App = () => {

  const [state, setState] = useState({
    email: undefined
  });

  useEffect(() => {
    // returns a CognitoUserSession object which contains JWT accessToken, idToken, and refreshToken.
    // will automatically refresh the accessToken and idToken if tokens are expired and a valid refreshToken presented
    Auth.currentSession().then(
      userSession => setState({ email: decodeToken(userSession.getIdToken().getJwtToken()).email })
    );

    // Schedule check and refresh (when needed) of JWT's every 5 min: (5 * 60 * 1000 = 300,000 milliseconds)
    const i = setInterval(() => Auth.currentSession(), 5 * 60 * 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2> Welcome To The Private Octank Page</h2>
        <p>Your email: <strong>{state.email}</strong></p>
        <img src={logo} className="App-logo" alt="logo" />
        <button className="SO-button" onClick={() => Auth.signOut()}>Sign out</button>
      </header>
    </div>
  );
}

export default App;
