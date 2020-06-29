/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';


import ProductList from './components/productList';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Root } from 'native-base';
//import { Rating, AirbnbRating } from 'react-native-ratings';

const Stack = createStackNavigator();


/*class App extends Component {
  async ratingCompleted( rating ) {
    console.log(rating);
  }

  render(){
    return (
      <View
        style={{
          marginTop: 'auto',
          marginBottom: 'auto',
        }}>
      <AirbnbRating
        count={5}
        reviews={["Terrible", "Bad", "OK", "Good", "Amazing"]}
        showRating={false}
        defaultRating={0}
        onFinishRating={this.ratingCompleted}
        size={20}
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
