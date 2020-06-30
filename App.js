/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';


import ProductList from './components/productList';
import {View} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Root } from 'native-base';
//import StarRating from 'react-native-star-rating';
//import { Rating, AirbnbRating } from 'react-native-ratings';

const Stack = createStackNavigator();

//var starCount = 0
/*class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      starCount: 3.5
    };
  }
 
  
 
  render() {
    return (
      <View style={{alignItems:'center'}}>
      <StarRating
        disabled={false}
        maxStars={5}
        rating={this.state.starCount}
        selectedStar={(rating) => this.onStarRatingPress(rating)}
      />
      </View>
    );
  }
};

export default App;*/

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
