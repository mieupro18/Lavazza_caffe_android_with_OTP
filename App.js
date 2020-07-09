/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';

import ProductList from './components/productList';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import registerScreen from './components/registerScreen';
import connectingScreen from './components/connectingScreen';
//import registerScreen from './components/registerScreen';
//import TestWifiModule from './components/TestWifiModule';
//import StarRating from 'react-native-star-rating';
//import { Rating, AirbnbRating } from 'react-native-ratings';

const Stack = createStackNavigator();

/*
class App extends Component {
  constructor(props) {
    super(props);
  }
 componentWillUnmount(){
   await TestWifiModule.forgetNetwork()
 }


  render() {
    return (
      <Root>
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Lavazza" headerMode="none">
      <Stack.Screen name="Lavazza" component={ProductList}
      options={{
        headerShown:false,
      }
      } />
    </Stack.Navigator>
    </NavigationContainer>
    </Root>
    );
  }
};

export default App;*/

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="connectingScreen" headerMode="none">
        <Stack.Screen
          name="registerScreen"
          component={registerScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="connectingScreen"
          component={connectingScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="productList"
          component={ProductList}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
