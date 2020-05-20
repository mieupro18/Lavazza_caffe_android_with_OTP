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
// import P2P from './components/p2p';

// import MultiPeer from './components/multipeer';

// import WifiHotspot from './components/wifi-hotspot';
// import WifiReborn from './components/wifi-reborn';

const App = () => {
  return (
    <Container>
      <Header style={{backgroundColor: '#b85400'}} androidStatusBarColor="#000">
        <Left />
        <Body>
          <Title>LavAzza</Title>
        </Body>
        <Right />
      </Header>
      {/* <WifiReborn /> */}
      <ProductList />
    </Container>
  );
};

export default App;
