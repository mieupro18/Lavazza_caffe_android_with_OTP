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
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import OTPInputView from '@twotalltotems/react-native-otp-input';
export default class authenticationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileNumber: null,
      splashScreenVisible: true,
      otpScreenVisible: false,
      otp: null,
      enteredOTP: 0,
      ResendOTPButtonVisible: false,
      timer: null,
    };
  }

  async componentDidMount() {
    setTimeout(async () => {
      this.setState({
        splashScreenVisible: false,
      });
    }, 3000);
  }

  sendOtp = async () => {
    this.state.otp = Math.floor(1000 + Math.random() * 9000);
    console.log(this.state.otp);
    const URL =
      'http://login.bulksmsgateway.in/sendmessage.php?user=FHCL&password=Fhcl$m$@12@&mobile=' +
      this.state.mobileNumber +
      '&message=OTP for Lavazza Caffe is :' +
      this.state.otp +
      '. OTP valid upto : 5 minutes. Please DO NOT SHARE with anyone \n- Lavazza&sender=INVITE&type=3';
    console.log(URL);
    fetch(URL)
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'success') {
          this.setState({otpScreenVisible: true});
          this.setState({timer: 20});
          this.intervalId = BackgroundTimer.setInterval(async () => {
            console.log(this.state.timer);
            if (this.state.timer === 0) {
              this.setState({
                ResendOTPButtonVisible: true,
                timer: null,
                enteredOTP: null,
              });
              BackgroundTimer.clearInterval(this.intervalId);
            } else {
              this.setState({timer: this.state.timer - 1});
            }
          }, 1000);
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
    if (this.state.enteredOTP == this.state.otp) {
      BackgroundTimer.clearInterval(this.intervalId);
      this.props.navigation.navigate('connectingScreen');
    } else {
      Alert.alert('', 'Invalid OTP', [{text: 'Ok'}]);
    }
    console.log('check');
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
              {this.state.otpScreenVisible ? (
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <OTPInputView
                    style={{width: '80%', color: '#100A45', height: 100}}
                    pinCount={4}
                    //code={this.state.enteredOTP} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                    // onCodeChanged = {code => { this.setState({code})}}
                    // autoFocusOnLoad
                    //codeInputFieldStyle={styles.underlineStyleBase}
                    //codeInputHighlightStyle={styles.underlineStyleHighLighted}
                    placeholderTextColor='#100A45'
                    clearInputs={true}
                    onCodeFilled={code => {
                      console.log('code', code);
                      this.state.enteredOTP = code;
                      this.checkOTPValidity();
                    }}
                    //console.log(`Code is ${code}, you are good to go!`);
                    //}}
                  />
                  {this.state.ResendOTPButtonVisible ? (
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
                        this.setState({ResendOTPButtonVisible: false});
                        this.sendOtp();
                      }}>
                      <Text style={{color: 'white'}}>Resend OTP</Text>
                    </TouchableHighlight>
                  ) : (
                    <Text style={{color: '#100A45'}}>
                      Resend OTP After : {this.state.timer}sec
                    </Text>
                  )}
                </View>
              ) : (
                <View>
                  <View style={{marginTop: 30, alignItems: 'center'}}>
                    <TextInput
                      style={{
                        height: 40,
                        width: '80%',
                        color: '#100A45',
                        borderColor: 'gray',
                        borderWidth: 1,
                        borderRadius: 10,
                        backgroundColor: '#EBEBEB',
                      }}
                      keyboardType="number-pad"
                      placeholder=" Mobile Number"
                      fontSize={15}
                      onChangeText={number =>
                        (this.state.mobileNumber = number)
                      }
                    />
                  </View>

                  <View style={{alignItems: 'center', marginTop: 30}}>
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
                        this.onSubmit();
                      }}>
                      <Text style={{color: 'white'}}>Submit</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              )}
            </View>
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
    height: 200,
    justifyContent: 'center',
    marginTop: '50%',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 50,
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
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
  },

  underlineStyleHighLighted: {
    borderColor: '#03DAC6',
  },
});
