/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Alert,
  ActivityIndicator,
  AppState,
  Text,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import TestWifiModule from './TestWifiModule';
import BackgroundTimer from 'react-native-background-timer';

export default class connectingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      splashScreenVisible: true,
      isConnecting: false,
      isbackgroundTimerOn: false,
    };
  }

  sendFeedbackData = async () => {
    const netInfo = await NetInfo.fetch();
    console.log('Internet Connection :', netInfo.isInternetReachable);
    const storedValue = JSON.parse(await AsyncStorage.getItem('feedbackData')); //.then((value) => console.log(value))
    console.log('Data :', storedValue);
    return true;
  };

  handleAppStateChange = async state => {
    if (state === 'background') {
      this.intervalId = BackgroundTimer.setInterval(async () => {
        if (await this.sendFeedbackData()) {
          BackgroundTimer.clearInterval(this.intervalId);
        }
      }, 5000);
    } else if (state === 'active') {
      if (this.state.isbackgroundTimerOn === true) {
        BackgroundTimer.clearInterval(this.intervalId);
        this.setState({isbackgroundTimerOn: false});
      }
    }
  };
  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    await this.sendFeedbackData();
    setTimeout(async () => {
      this.setState({
        splashScreenVisible: false,
      });
    }, 3000);
  }

  async componentWillUnmount() {
    AppState.removeEventListener('change');
  }

  onConnect = async () => {
    TestWifiModule.isWifiTurnedOn()
      .then(async enabled => {
        if (!enabled) {
          Alert.alert(
            '',
            'Please check your connection with the lavazza caffe macine',
            [{text: 'ok'}],
          );
          this.setState({isConnecting: false});
        } else {
          this.getProductInfo();
        }
      })
      .catch(async e => {
        console.log(e);
        this.setState({isConnecting: false});
        Alert.alert('', 'Something Went Wrong...Please restart the app', [
          {text: 'Ok'},
        ]);
      });
  };

  getTimeoutSignal = async () => {
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, 5000);
    return controller;
  };

  getProductInfo = async () => {
    console.log('get Product Info');
    /*const temp = [
      {productId: 106, productName: 'Cappuccino'},
      {productId: 101, productName: 'South Indian Coffee Light'},
      {productId: 104, productName: 'Milk'},
      {productId: 107, productName: 'South Indian Coffee Strong'},
      {productId: 102, productName: 'Espresso'},
      {productId: 108, productName: 'Tea Milk'},
      {productId: 105, productName: 'Tea Water'},
      {productId: 103, productName: 'Lemon Tea'},
    ];
    this.props.navigation.navigate('productList', {
      productList: temp,
    });
    this.setState({isConnecting: false});*/
    fetch('http://192.168.5.1:9876/productInfo', {
      headers: {
        tokenId: 'secret',
      },
      signal: (await this.getTimeoutSignal()).signal,
    })
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          this.props.navigation.navigate('productList', {
            productList: resultData.data,
            machineName: resultData.machineName,
          });
          setTimeout(() => {
            this.setState({isConnecting: false});
          }, 1000);
        } else {
          Alert.alert('', 'Something Went Wrong...Please reconnect', [
            {text: 'Ok'},
          ]);
          this.setState({isConnecting: false});
        }
      })
      .catch(async e => {
        Alert.alert(
          '',
          'Please check your connection with the lavazza caffe macine',
          [{text: 'ok'}],
        );
        console.log(e);
        this.setState({isConnecting: false});
      });
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#ffffff'}}>
        {this.state.splashScreenVisible ? (
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../assets/lavazza_logo_with_year.png')}
            />
          </View>
        ) : (
          <View style={styles.centeredView}>
            <Image
              style={{height: 100, resizeMode: 'contain'}}
              source={require('../assets/lavazza_logo_with_year.png')}
            />

            <View
              style={{borderRadius: 125, overflow: 'hidden', marginTop: 10}}>
              <Image
                style={{width: 250, height: 250}}
                source={require('../assets/connect.gif')}
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
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  logo: {
    width: '50%',
    height: '75%',
    resizeMode: 'contain',
  },
  logoContainer: {
    height: 150,
    justifyContent: 'center',
    marginTop: '50%',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
