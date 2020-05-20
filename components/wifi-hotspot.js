import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ToastAndroid,
  FlatList,
  PermissionsAndroid,
} from 'react-native';
// import Hotspot from 'react-native-wifi-hotspot';

import WifiManager from 'react-native-wifi-reborn';

export default class App extends Component {
  constructor(props) {
    super(props);
    // this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      peers: [],
      dataSource: [],
    };
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={{marginBottom: 10}}>
          <Text style={styles.subtitle}>Connect</Text>
          <Button title="connect" onPress={() => this.connect()} />
        </View>
        <View>
          <Text style={styles.subtitle}>Show all Available Wifi</Text>
          <Button
            title="Get Wifi Details"
            onPress={() => this.getAvailableWifiDetails()}
          />
        </View>
      </View>
    );
  }

  connect() {
    WifiManager.connectToProtectedSSID('Rascal', 'subash11', false).then(
      () => {
        console.log('Connected successfully!');
      },
      () => {
        console.log('Connection failed!');
      },
    );
  }
  getAvailableWifiDetails = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission is required for WiFi connections',
        message:
          'This app needs location permission as this is required  ' +
          'to scan for wifi networks.',
        buttonNegative: 'DENY',
        buttonPositive: 'ALLOW',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('peers clicked');
      WifiManager.loadWifiList().then(response => {
        console.log(response);
      });
    } else {
      // Permission denied
      console.log('peers clicked else');
      WifiManager.loadWifiList().then(response => {
        console.log(response);
      });
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#F5FCFF',
    margin: 8,
  },
  welcome: {
    fontSize: 20,
    height: 60,
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  viewList: {
    backgroundColor: '#F1F1F1',
    marginBottom: 10,
  },
  viewText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
});
