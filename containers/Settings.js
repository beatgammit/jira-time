/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { connect } from 'react-redux'
import { setUsername, setApiToken, setServer } from '../actions';
import SettingsScreen from '../components/Settings'

const mapStateToProps = state => state.settings;

const mapDispatchToProps = dispatch => {
  return {
    usernameChanged: username => dispatch(setUsername(username)),
    apiTokenChanged: apiToken => dispatch(setApiToken(apiToken)),
    serverChanged: server => dispatch(setServer(server)),
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsScreen);
