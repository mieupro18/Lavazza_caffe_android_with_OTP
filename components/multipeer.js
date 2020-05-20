import React, {Component} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
} from 'react-native';

import MultipeerConnectivity from 'react-native-multipeer';

// function getStateFromSources() {
//   var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
//     return {
//       dataSource: ds.cloneWithRows(MultipeerConnectivity.getAllPeers())
//     };
// }

class peerApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
    };
  }

  // getInitialState: function() {
  //   return getStateFromSources()
  // }
  async componentDidMount() {
    setInterval(() => {
      console.log(MultipeerConnectivity.getAllPeers());
    }, 10000);

    await this.setState({data: MultipeerConnectivity.getAllPeers()});
    console.log(this.state.data)
    MultipeerConnectivity.on('peerFound', this._onChange);
    MultipeerConnectivity.on('peerLost', this._onChange);
    MultipeerConnectivity.on('invite', event => {
      // Automatically accept invitations
      MultipeerConnectivity.rsvp(event.invite.id, true);
    });
    MultipeerConnectivity.on('peerConnected', event => {
      alert(event.peer.id + ' connected!');
    });
    // MultipeerConnectivity.advertise('channel1', {
    //   name: 'User-' + Math.round(1e6 * Math.random()),
    // });
    // MultipeerConnectivity.browse('channel1');
  }


  renderRow = peer => {
    console.log('In Render Row');
    console.log(peer);
    return (
      <TouchableHighlight
        onPress={this.invite.bind(this, peer)}
        style={styles.row}>
        <View>
          <Text>{peer.name}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList>
          data={this.state.data}
          renderItem={this.renderRow}
        </FlatList>
        {/* <ListView
          style={styles.peers}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
        /> */}
      </View>
    );
  }

  _invite(peer) {
    MultipeerConnectivity.invite(peer.id);
  }

  _onChange = async () => {
    await this.setState({data: MultipeerConnectivity.getAllPeers()});
  };
}

export default peerApp;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
  },
});

