/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import {SafeAreaView, StyleSheet, ScrollView, Image} from 'react-native';

import {
  Container,
  Header,
  Content,
  Title,
  Footer,
  FooterTab,
  Text,
  Button,
  Icon,
  Left,
  Body,
  Right,
} from 'native-base';

import ProductList from './components/productList';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Lavazza" headerMode="none">
      <Stack.Screen name="Lavazza" component={ProductList}
      options={{
        headerShown:false,
      }
      } />
    </Stack.Navigator>
    </NavigationContainer>
   
  );
};

export default App;

