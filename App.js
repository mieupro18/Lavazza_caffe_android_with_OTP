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
<<<<<<< Updated upstream
// import P2P from './components/p2p';

// import MultiPeer from './components/multipeer';

// import WifiHotspot from './components/wifi-hotspot';
// import WifiReborn from './components/wifi-reborn';

import AndroidWifi from './components/android-wifi';

const App = () => {
  return (
=======
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

/*
 <Provider store={store}>
>>>>>>> Stashed changes
    <Container>
      <Header style={{backgroundColor: '#b85400'}} androidStatusBarColor="#000">
        <Left />
        <Body>
          <Title>LavAzza</Title>
        </Body>
        <Right />
      </Header>
<<<<<<< Updated upstream
      {/* <AndroidWifi /> */}
      <ProductList />
    </Container>
  );
};

export default App;
=======
      {/* <AndroidWifi /> */
      /*<ProductList store={store}/>
    </Container>
    </Provider>*/
>>>>>>> Stashed changes
