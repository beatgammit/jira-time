/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react'
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

import base64 from 'base-64';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };

  constructor(props) {
    super();
    this.state = {
      filters: [],
      boards: [],
      issues: [],
    };
  }

  componentDidMount() {
    this.basicFetch('/rest/api/2/filter/my')
      .then(response => response.json())
      .then(response => this.setState({filters: response}));

    this.basicFetch('/rest/agile/1.0/board')
      .then(response => response.json())
      .then(response => this.setState({boards: response.values}));

    fetch(this.genURL('/rest/api/2/search'), {
      method: 'POST',
      headers: this.genBasicAuth(),
      body: JSON.stringify({jql: "assignee = currentUser() and status != Done"}),
    })
      .then(response => {
        if (!response.ok) {
          console.log('Error code:', response.status, response.statusText, response.headers);
          throw new Error(response.statusText);
        }
        return response;
      })
      .then(response => {
        console.log('got response:', response);
        return response.json();
      })
      .then(response => {
        console.log('res:', response);
        let issues = response.issues;
        this.setState({issues: response.issues})
      })
      .catch(err => console.error('error doing things:', err.toString()));
  }

  basicFetch(endpoint) {
    return fetch(this.genURL(endpoint), this.genDefaultFetchObj());
  }

  genURL(endpoint) {
    return 'https://' + this.props.server + endpoint;
  }
  
  genDefaultFetchObj() {
    return { headers: this.genBasicAuth(this.props.username, this.props.apiToken) };
  }

  genBasicAuth(username = this.props.username, password = this.props.apiToken) {
    return new Headers({
      'Authorization': 'Basic ' + base64.encode(username + ":" + password),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/*<Text>Find issues by:</Text>*/}
        {/*<Button title="Settings" onPress={() => this.props.navigation.navigate('Settings')}/>*/}

        <Text>You have {this.state.boards.length} boards.</Text>
        {/*this.state.boards.map(board => <Board key={board.id} val={board}></Board>)*/}

        <Text>You have {this.state.filters.length} filters.</Text>
        {/*this.state.filters.map(filter => <Filter key={filter.id} val={filter}></Filter>)*/}

        <Text>You have {this.state.issues.length} issues.</Text>
        <FlatList
          data={this.state.issues}
          renderItem={({item}) => <Issue key={item.id} val={item} />}
        />
      </View>
    );
  }
}

class Board extends React.Component {
  render() {
    return (
      <Text>{this.props.val.location.name}: {this.props.val.name}</Text>
    )
  }
}

class Filter extends React.Component {
  render() {
    return (
      <Text>{this.props.val.owner.name}: {this.props.val.name}</Text>
    );
  }
}

const workHoursPerDay = 8;
const workdaysPerWeek = 5;

const secondsInMinute = 60;
const secondsInHour = secondsInMinute * 60;
const secondsInDay = secondsInHour * workHoursPerDay;
const secondsInWeek = secondsInDay * workdaysPerWeek;

class Issue extends React.Component {
  formatTime(seconds) {
    if (!seconds) {
      // in case it's null, undefined, etc
      seconds = 0;
    }

    let weeks = Math.floor(seconds / secondsInWeek);
    seconds %= secondsInWeek;
    let days = Math.floor(seconds / secondsInDay);
    seconds %= secondsInDay;
    let hours = Math.floor(seconds / secondsInHour);
    seconds %= secondsInHour;
    let minutes = Math.floor(seconds / secondsInMinute);
    seconds %= secondsInMinute;

    let str = '';
    if (weeks > 0) {
      str += ' ' + weeks + 'w';
    }
    if (days > 0) {
      str += ' ' + days + 'd';
    }
    if (hours > 0) {
      str += ' ' + hours + 'h';
    }
    if (minutes > 0) {
      str += ' ' + minutes + 'm';
    }

    if (seconds > 0) {
      str += ' ' + seconds + 's';
    }

    return str.replace(/^ /, '') || 'no time est';
  }

  render() {
    return (
      <View>
        <Text>
          {this.props.val.key}: {this.props.val.fields.status.name} - {this.props.val.fields.summary} | {this.formatTime(this.props.val.fields.timeestimate)}
        </Text>
        {/*<Button title="Settings" onPress={() => this.props.navigation.navigate('Settings')}/>*/}
      </View>
    );
  }
}
