/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Modal,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
  BackHandler,
  AppState,
  DeviceEventEmitter,
} from 'react-native';
import {Text} from 'native-base';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import TestWifiModule from './TestWifiModule';
import {TextInput, ScrollView} from 'react-native-gesture-handler';
import App from '../App';

export default class connectingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      splashScreenVisible: true,
      isConnecting: false,
      modalVisible: false,
    };
  }

  sendFeedbackData = async () => {
    const netInfo = await NetInfo.fetch();
    console.log('Internet Connection :', netInfo.isInternetReachable);
    const storedValue = JSON.parse(await AsyncStorage.getItem('feedbackData')); //.then((value) => console.log(value))
    console.log('Data :', storedValue);
  };

  async componentDidMount() {
    await this.sendFeedbackData();
    setTimeout(async () => {
      this.setState({
        splashScreenVisible: false,
        modalVisible: true,
      });
      await this.askForUserPermissions();
      console.log('crossed permission access stage');
    }, 3000);
  }

  async componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.hardwarebackButtonHandler,
    );
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  askForUserPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Wifi networks',
          message: 'We need your permission in order to find wifi networks',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Thank you for your permission! :)');
      } else {
        Alert.alert(
          'Info',
          'Please provide location permission to access the app',
          [{text: 'Okay'}],
        );
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Info', 'Please restart the app', [
        {text: 'Close app', onPress: () => BackHandler.exitApp()},
      ]);
    }
  };

  hardwarebackButtonHandler = async () => {
    if (this.state.isConnecting === true) {
      console.log('please dont go back');
    }
  };

  handleAppStateChange = async state => {
    if (state === 'background') {
      console.log('background');
      //await TestWifiModule.forgetNetwork();
      /*if (this.state.isConnecting === true) {
        console.log('yeah');
        await TestWifiModule.forgetNetwork();
        this.exitApp();
      }*/
    }
  };

  removeRegisteredEventListener = async () => {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.hardwarebackButtonHandler,
    );
    AppState.removeEventListener('change', this.handleAppStateChange);
  };

  onConnect = async () => {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.hardwarebackButtonHandler,
    );
    AppState.addEventListener('change', this.handleAppStateChange);
    TestWifiModule.isWifiTurnedOn()
      .then(async enabled => {
        if (!enabled) {
          console.log(await TestWifiModule.turnOnWifi());
        }
        console.log(await TestWifiModule.connectToCoffeeMachine());
        setTimeout(async () => {
          console.log('Connection check');
          const connected = await TestWifiModule.isConnectedToGivenSSID();
          console.log(connected);
          if (connected) {
            var ip = await TestWifiModule.getDefaultGatewayIp();
            // eslint-disable-next-line no-bitwise
            var firstByte = ip & 255;
            // eslint-disable-next-line no-bitwise
            var secondByte = (ip >> 8) & 255;
            // eslint-disable-next-line no-bitwise
            var thirdByte = (ip >> 16) & 255;
            // eslint-disable-next-line no-bitwise
            var fourthByte = (ip >> 24) & 255;
            var ipaddress =
              firstByte + '.' + secondByte + '.' + thirdByte + '.' + fourthByte;
            console.log(ipaddress);
            this.getProductInfo();
          } else {
            console.log('Connection to the coffee machine failed');
            console.log(
              'Disconnect from machine',
              await TestWifiModule.forgetNetwork(),
            );
            this.setState({isConnecting: false});
            Alert.alert('Info', 'Something Went Wrong...Please reconnect', [
              {text: 'Okay'},
            ]);
            this.removeRegisteredEventListener();
          }
        }, 3000);
      })
      .catch(async e => {
        console.log(e);
        console.log(
          'Disconnect from machine',
          await TestWifiModule.forgetNetwork(),
        );
        this.setState({isConnecting: false});
        Alert.alert('Info', 'Something Went Wrong...Please reconnect', [
          {text: 'Okay'},
        ]);
        this.removeRegisteredEventListener();
      });
  };

  getProductInfo = async () => {
    console.log('get Product Info');
    fetch('http://192.168.5.1:9876/getProductInfo', {
      headers: {
        tokenId: 'secret',
      },
    })
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          this.props.navigation.navigate('productList', {
            productList: resultData.data,
          });
          setTimeout(() => {
            this.removeRegisteredEventListener();
            this.setState({isConnecting: false});
          }, 1000);
        } else {
          console.log(
            'Disconnect from machine',
            await TestWifiModule.forgetNetwork(),
          );
          Alert.alert('Info', 'Something Went Wrong...Please reconnect', [
            {text: 'Okay'},
          ]);
          this.removeRegisteredEventListener();
          this.setState({isConnecting: false});
        }
      })
      .catch(async e => {
        console.log(
          'Disconnect from machine',
          await TestWifiModule.forgetNetwork(),
        );
        Alert.alert('Info', 'Network error...Please reconnect', [
          {text: 'Okay'},
        ]);
        console.log(e);
        this.setState({isConnecting: false});
        this.removeRegisteredEventListener();
      });
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#ffffff'}}>
        {this.state.splashScreenVisible ? (
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../productImages/Lavazza.png')}
            />
          </View>
        ) : null}

        {this.state.modalVisible ? (
          <View style={styles.centeredView}>
            <Image
              style={{width: 150, height: 75}}
              source={require('../productImages/Lavazza.png')}
            />
            <View
              style={{borderRadius: 125, overflow: 'hidden', marginTop: 20}}>
              <Image
                style={{width: 250, height: 250}}
                source={require('../productImages/connect.gif')}
              />
            </View>
            {this.state.isConnecting ? (
              <View style={{flexDirection: 'row', marginTop: 20}}>
                <ActivityIndicator size="small" color="#100A45" />
                <Text style={{color: '#100A45', fontWeight: 'bold'}}>
                  Connecting...!
                </Text>
              </View>
            ) : (
              <View style={{alignItems: 'center', marginTop: 20}}>
                <TouchableHighlight
                  underlayColor="#100A45"
                  style={{
                    width: 100,
                    height: 40,
                    borderRadius: 5,
                    backgroundColor: '#100A45',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    this.setState({isConnecting: true});
                    this.onConnect();
                  }}>
                  <Text style={{color: 'white'}}>Connect</Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 100,
  },
  logoContainer: {
    //flex:1,
    justifyContent: 'center',
    marginTop: '50%',
    alignItems: 'center',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    /*alignItems: 'center',*/
    backgroundColor: '#b85400',
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 50,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restrictedAccessButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productName: {
    textShadowColor: '#100A45',
    //textShadowOffset: {width: -1, height: 1},
    //textShadowRadius: 10,
    //fontFamily: 'TimesNewroman',
    fontSize: 15,
    fontWeight: 'bold',
    //flexWrap: 'wrap',

    color: '#100A45',
  },
});
