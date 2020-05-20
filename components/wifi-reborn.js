import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Text,
  Button,
  PermissionsAndroid,
} from 'react-native';

import WifiManager from 'react-native-wifi-reborn';

class WifiReborn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      ssid: 'Redmi 4',
      password: 'siddhu12',
      isWep: false,
    };
  }

  async componentDidMount() {
    await WifiManager.setEnabled(true);
  }
  connect = async () => {
    WifiManager.connectionStatus().then(async response => {
      console.log(response);
      if (!response) {
        try {
          const data = await WifiManager.connectToProtectedSSID(
            this.state.ssid,
            this.state.password,
            this.state.isWep,
          );
          console.log('Connected successfully!', {data});
        } catch (error) {
          console.log('Connection failed!', {error});
        }
      }
    });
  };

  getStatus = async () => {
    try {
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
      }
      // const ssid = await WifiManager.getCurrentWifiSSID();

      // console.log('Your current connected wifi SSID is ' + ssid);
    } catch (error) {
      console.log('Cannot get current SSID!', {error});
    }
  };
  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />

        <View style={{marginBottom: 10}}>
          <Text style={styles.subtitle}>Connect</Text>
          <Button title="connect" onPress={() => this.connect()} />
        </View>
        <View>
          <Text style={styles.subtitle}>Show all Available Wifi</Text>
          <Button title="Get Wifi Details" onPress={() => this.getStatus()} />
        </View>
        <View>
          <Text style={styles.subtitle}>Show all Available Wifi</Text>
          <Button
            title="Disconnect"
            onPress={() => {
              WifiManager.disconnect();
              WifiManager.setEnabled(false);
            }}
          />
        </View>
      </>
    );
  }
}

export default WifiReborn;

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
