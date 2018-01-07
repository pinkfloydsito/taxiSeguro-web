import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import PropTypes from 'prop-types';
import 'typeface-roboto';
import { Route } from 'react-router';
import { history } from '../store';
import App from '../containers/App';
import Map from '../containers/Map';
import RouteList from '../containers/RouteList';
import '../index.css'; // global css
import '../Styles/bootstrap.min.css'; // bootstrap grid system css
import '../Styles/bootstrap-theme.css'; // bootstrap grid system css

injectTapEventPlugin();

const target = document.querySelector('#root');

const Root = ({ store }) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <App>
          <Route path="/" component={Map} />
          <Route path="/" component={RouteList} />
        </App>
      </div>
    </ConnectedRouter>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.oneOfType([
    PropTypes.func.isRequired,
    PropTypes.object.isRequired,
  ]).isRequired,
};


export default Root;
