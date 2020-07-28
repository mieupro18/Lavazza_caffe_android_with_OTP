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
import {IPADDRESS, PORT, HTTPS} from './macros';

export default class connectingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnecting: false,
      isbackgroundTimerOn: false,
    };
  }
  //http://34.71.69.61:9876/sendFeedbackData
  sendFeedbackData = async feedbackData => {
    const netInfo = await NetInfo.fetch();
    console.log('Internet Connection :', netInfo.isInternetReachable);
    if (netInfo.isInternetReachable) {
      fetch('https://mieupro.pythonanywhere.com/feedback', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: (await this.getTimeoutSignal()).signal,
        body: JSON.stringify(feedbackData),
      })
        .then(response => response.json())
        .then(async resultData => {
          if (resultData.status === 'Success') {
            console.log('data send');
            BackgroundTimer.clearInterval(this.intervalId);
            this.setState({isbackgroundTimerOn: false});
            AsyncStorage.removeItem('feedbackData');
          }
        })
        .catch(async e => {
          console.log(e);
        });
    }
  };

  handleAppStateChange = async state => {
    try {
      if (state === 'background') {
        console.log('background');
        var feedbackData = JSON.parse(
          await AsyncStorage.getItem('feedbackData'),
        );
        if (feedbackData === null) {
          console.log('null data');
        } else {
          this.intervalId = BackgroundTimer.setInterval(async () => {
            await this.sendFeedbackData(feedbackData);
          }, 300000);
          this.setState({isbackgroundTimerOn: true});
        }
      } else if (state === 'active') {
        console.log('active');
        if (this.state.isbackgroundTimerOn === true) {
          BackgroundTimer.clearInterval(this.intervalId);
          this.setState({isbackgroundTimerOn: false});
        }
      }
    } catch (error) {
      console.log('background error', error);
    }
  };

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  async componentWillUnmount() {
    AppState.removeEventListener('change');
  }

  onConnect = async () => {
    //this.setState({isConnecting: true});
    //this.getProductInfo();
    TestWifiModule.isWifiTurnedOn()
      .then(async enabled => {
        if (!enabled) {
          Alert.alert(
            '',
            'Please check your connection with the lavazza caffè machine',
            [{text: 'ok'}],
          );
          this.setState({isConnecting: false});
        } else {
          this.setState({isConnecting: true});
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
    }, 10000);
    return controller;
  };

  getProductInfo = async () => {
    console.log('get Product Info');
    console.log(HTTPS, PORT, IPADDRESS);
    fetch(HTTPS + '://' + IPADDRESS + ':' + PORT + '/productInfo', {
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
            machineId: resultData.machineId,
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
          'Please check your connection with the lavazza caffè machine',
          [{text: 'ok'}],
        );
        console.log(e);
        this.setState({isConnecting: false});
      });
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#ffffff'}}>
        <View style={styles.centeredView}>
          <Image
            style={{height: 100, resizeMode: 'contain'}}
            source={require('../assets/lavazza_logo_with_year.png')}
          />

          <View style={{borderRadius: 115, overflow: 'hidden'}}>
            <Image
              style={{width: 230, height: 230}}
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
                  this.onConnect();
                }}>
                <Text style={{color: 'white'}}>Connect</Text>
              </TouchableHighlight>
            </View>
          )}
        </View>
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
    height: 200,
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
