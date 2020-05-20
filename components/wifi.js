import React, {Component} from 'react';
import WifiManager from 'react-native-wifi';
import {View, Button} from 'native-base';
import {Text} from 'react-native';
class WifiTest extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  connect = async () => {
    WifiManager.connectToProtectedSSID(ssid, password, isWep).then(
      () => {
        console.log('Connected successfully!');
      },
      () => {
        console.log('Connection failed!');
      },
    );
  };

  getstatus = async () => {
    WifiManager.getCurrentWifiSSID().then(
      ssid => {
        console.log('Your current connected wifi SSID is ' + ssid);
      },
      () => {
        console.log('Cannot get current SSID!');
      },
    );
  };

  showList = async () => {
    WifiManager.loadWifiList().then(response => {
      console.log(response);
    });
  };
  render() {
    return (
      <View>
        <View>
          <Button
            onPress={() => {
              this.connect();
            }}>
            <Text>connect</Text>
          </Button>
        </View>

        <View>
          <Button
            onPress={() => {
              this.getstatus();
            }}>
            <Text>Get Status</Text>
          </Button>
        </View>

        <View>
          <Button
            onPress={() => {
              this.showList();
            }}>
            <Text>showList</Text>
          </Button>
        </View>
      </View>
    );
  }
}

export default WifiTest;
