import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import config from './config';


Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  Storage: {
    region: config.s3.REGION,
    bucket: config.s3.BUCKET,
    identityPoolId: config.cognito.IDENTITY_POOL_ID
  },
  API: {
    endpoints: [
      {
        name: "albums",
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION
      },
    ]
  }
});

const history = createBrowserHistory();
let app = document.getElementById('app');
if (app)
{
  // 1. Set up the browser history with the updated location
    // (minus the # sign)
  console.log('window.location.hash', window.location.hash);
  const path = (/#!(\/.*)$/.exec(window.location.hash) || [])[1];
  console.log('path', path);
	if (path) {
		history.replace(path);
	}

    // 2. Render our app
	//render(<App />, app);
}


ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
