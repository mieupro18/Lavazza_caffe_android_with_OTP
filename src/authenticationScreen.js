/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Alert,
  TextInput,
  Text,
  Modal,
  Keyboard,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import AsyncStorage from '@react-native-community/async-storage';
export default class authenticationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileNumber: null,
      splashScreenVisible: true,
      otpScreenVisible: false,
      otp: [],
      enteredOTP: null,
    };
  }

  async componentDidMount() {
    //AsyncStorage.setItem('isUserVerified', '');
    const isUserVerified = await AsyncStorage.getItem('isUserVerified'); //.then(async data =>
    console.log(isUserVerified);
    setTimeout(async () => {
      if (isUserVerified === 'true') {
        this.props.navigation.replace('connectingScreen');
      } else {
        this.setState({
          splashScreenVisible: false,
        });
      }
    }, 3000);
  }

  getTimeoutSignal = async () => {
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, 10000);
    return controller;
  };

  sendOtp = async () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    this.state.otp.push(otp.toString());
    console.log(this.state.otp);
    const URL =
      'http://login.bulksmsgateway.in/sendmessage.php?user=FHCL&password=Fhcl$m$@12@&mobile=' +
      this.state.mobileNumber +
      '&message=OTP for Lavazza Caffè is ' +
      otp +
      '. Please DO NOT SHARE with anyone "Enjoy a safe cup of refreshment" - Lavazza&sender=LVZAPP&type=3';
    console.log(URL);
    fetch(URL, {signal: (await this.getTimeoutSignal()).signal})
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'success') {
          this.setState({otpScreenVisible: true});
        } else {
          Alert.alert('', 'Please check the Internet connection', [
            {text: 'Ok'},
          ]);
        }
      })
      .catch(async e => {
        console.log(e);
        Alert.alert('', 'Please check the Internet connection', [{text: 'Ok'}]);
      });
  };

  checkOTPValidity = async () => {
    // eslint-disable-next-line eqeqeq
    if (this.state.otp.includes(this.state.enteredOTP)) {
      AsyncStorage.setItem('isUserVerified', 'true');
      this.props.navigation.replace('connectingScreen');
      Alert.alert('', 'Registered Successfully', [
        {
          text: 'Ok',
        },
      ]);
    } else {
      Alert.alert('', 'Invalid OTP', [{text: 'Ok'}]);
    }
  };

  onSubmit = async () => {
    if (this.state.mobileNumber !== null && this.state.mobileNumber !== '') {
      if (this.state.mobileNumber.match(/^\d{10}$/)) {
        this.sendOtp();
      } else {
        Alert.alert('', 'Invalid Mobile Number Format', [{text: 'Ok'}]);
      }
    } else {
      Alert.alert('', 'Please Enter the Number', [{text: 'Ok'}]);
    }
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
            <View style={styles.modalView}>
              <View style={{marginTop: 10, alignItems: 'center'}}>
                <Image
                  style={{width: 100, height: 25}}
                  source={require('../assets/lavazza_logo_without_year.png')}
                />
              </View>
              <View style={{marginTop: 20, alignItems: 'center'}}>
                <Text
                  style={{
                    color: '#100A45',
                    fontSize: 15,
                    fontWeight: 'bold',
                  }}>
                  USER REGISTRATION
                </Text>
                <TextInput
                  style={{
                    height: 40,
                    width: '80%',
                    color: '#100A45',
                    borderColor: 'gray',
                    borderWidth: 1,
                    borderRadius: 10,
                    backgroundColor: '#EBEBEB',
                    marginTop: 10,
                  }}
                  keyboardType="number-pad"
                  placeholder=" Mobile Number"
                  fontSize={15}
                  onChangeText={number => (this.state.mobileNumber = number)}
                />
              </View>
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
                    Keyboard.dismiss();
                    this.onSubmit();
                  }}>
                  <Text style={{color: 'white'}}>Submit</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        )}
        <Modal
          animationType="slide"
          visible={this.state.otpScreenVisible}
          onRequestClose={async () => {
            BackgroundTimer.clearInterval(this.intervalId);
            this.setState({
              otpScreenVisible: false,
              enteredOTP: null,
            });
            this.state.otp = [];
            console.log(this.state.otp);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <View style={{marginTop: 10, alignItems: 'center'}}>
                  <Image
                    style={{width: 100, height: 25}}
                    source={require('../assets/lavazza_logo_without_year.png')}
                  />
                </View>
                <Text
                  style={{
                    color: '#100A45',
                    fontSize: 15,
                    fontWeight: 'bold',
                    marginTop: 20,
                  }}>
                  OTP VERIFICATION
                </Text>

                <OTPInputView
                  style={{
                    width: '80%',
                    color: '#100A45',
                    height: 100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  pinCount={4}
                  autoFocusOnLoad={false}
                  codeInputFieldStyle={styles.underlineStyleBase}
                  codeInputHighlightStyle={styles.underlineStyleHighLighted}
                  placeholderTextColor="#100A45"
                  onCodeFilled={code => {
                    console.log('code', code);
                    this.state.enteredOTP = code;
                    Keyboard.dismiss();
                    this.checkOTPValidity();
                  }}
                />
                <Text
                  style={{
                    color: '#100A45',
                    fontSize: 12,
                    marginTop: 10,
                  }}>
                  OTP has been sent to
                </Text>
                <Text
                  style={{
                    color: '#100A45',
                    fontSize: 12,
                  }}>
                  +91 {this.state.mobileNumber}
                </Text>
                <TouchableHighlight
                  underlayColor="#100A45"
                  style={{
                    width: 100,
                    height: 40,
                    borderRadius: 5,
                    backgroundColor: '#100A45',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 20,
                  }}
                  onPress={() => {
                    this.sendOtp();
                  }}>
                  <Text style={{color: 'white'}}>Resend OTP</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
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
  },
  modalView: {
    margin: '12%',
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#100A45',
    borderWidth: 1.5,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 35,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  underlineStyleBase: {
    /*width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,*/
    color: '#100A45',
    borderColor: '#100A45',
  },

  underlineStyleHighLighted: {
    borderColor: '#100A45',
    color: '#100A45',
  },
});
