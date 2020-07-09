/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {StyleSheet, Image, View, TouchableHighlight, Modal} from 'react-native';
import {Text} from 'native-base';
import {TextInput} from 'react-native-gesture-handler';

class registerScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: null,
      splashScreenVisible: true,
    };
  }
  async componentDidMount() {
    setTimeout(async () => {
      this.setState({splashScreenVisible: false});
    }, 3000);
  }
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
        ) : (
          <View style={styles.centeredView}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Image
                style={{width: 150, height: 75}}
                source={require('../productImages/Lavazza.png')}
              />
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text
                style={{color: '#100A45', fontWeight: 'bold', fontSize: 10}}>
                Life Begins After Coffee !!
              </Text>
            </View>
            <View style={{marginTop: 30, alignItems: 'center'}}>
              <TextInput
                style={{
                  height: 40,
                  width: 250,
                  borderColor: 'gray',
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: '#EBEBEB',
                }}
                placeholder="Username(optional)"
                fontSize={12}
                onChangeText={text => (this.state.userName = text)}
              />
            </View>
            <View style={{marginTop: 20, alignItems: 'center'}}>
              <TextInput
                style={{
                  height: 40,
                  width: 250,
                  borderColor: 'gray',
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: '#EBEBEB',
                }}
                placeholder="Select Company"
                fontSize={12}
                onChangeText={text => (this.state.userName = text)}
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
                onPress={() => {}}>
                <Text style={{color: 'white'}}>Register</Text>
              </TouchableHighlight>
            </View>
          </View>
        )}
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
    //flex: 1,
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

export default registerScreen;
