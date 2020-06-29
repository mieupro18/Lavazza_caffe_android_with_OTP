

import React, { Component } from 'react';  
import 
{ Platform, 
  StyleSheet, 
  View, 
  Text,     
  Image, 
  TouchableOpacity, 
  Alert } from 'react-native';  

 export default class SplashScreen extends Component()
{  
   constructor(){  
     super();   
    }  
   
  componentDidMount(){  
    setTimeout(function(){  
      this.Hide_Splash_Screen();  
    }, 5000);  
   }  
   
    render()  
    {  
         return(  
             <View style = { styles.MainContainer }>  
                <Image source={{uri:'https://static.javatpoint.com/tutorial/react-native/images/react-native-tutorial.png'}}  />
            </View>  
        );  
    }  
}  
 const styles = StyleSheet.create(  
{  
    MainContainer:  
    {  
        flex: 1,  
        justifyContent: 'center',  
        alignItems: 'center',  
        paddingTop: ( Platform.OS === 'ios' ) ? 20 : 0  
    },  
   
    SplashScreen_RootView:  
    {  
        justifyContent: 'center',  
        flex:1,  
        margin: 10,  
        position: 'absolute',  
        width: '100%',  
        height: '100%',  
      },  
   
    SplashScreen_ChildView:  
    {  
        justifyContent: 'center',  
        alignItems: 'center',  
        backgroundColor: '#00BCD4',  
        flex:1,  
    },  
});  