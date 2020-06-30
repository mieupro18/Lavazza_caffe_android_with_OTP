/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  Alert,
  Modal,
  BackHandler,
  PermissionsAndroid,
  ActivityIndicator,
  AppState,
} from 'react-native';
import {
  Container,
  Content,
  Card,
  CardItem,
  Text,
  Body,
  Right,
  Left,
  Button,
  Toast,
} from 'native-base';
import NetInfo from '@react-native-community/netinfo';
import  AsyncStorage from '@react-native-community/async-storage';
import BackgroundTimer from 'react-native-background-timer';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TestWifiModule from "./TestWifiModule";
import { Rating, AirbnbRating } from 'react-native-ratings';
import { TouchableOpacity } from 'react-native-gesture-handler';


const BEFORE_PLACING_ORDER = 'Order your Beverage';
const ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE = 'Please wait for the order to be received';
const ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE = 'Order Received..Please wait';
const ORDER_DISPENSED = 'Your Beverage dispensed';
const UNABLE_TO_DISPENSE = 'Unable to dispense...Try again';


var ipaddress = '192.168.5.1';
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected:false,
      splashScreenVisible:true,
      isConnecting:false,
      selectedIndex: 0,
      deviceProductList: [],
      orderReceived:false,
      allProductListURL: [
        {
          productName: 'Cappuccino',
          src: require('../productImages/cappucino.jpg'),
        },
        {
          productName: 'Espresso',
          src: require('../productImages/espresso.jpg'),
        },
        {
          productName: 'Milk',
          src: require('../productImages/milk.jpg'),
        },
        {
          productName: 'South Indian Coffee Light',
          src: require('../productImages/SIC_light.jpg'),
        },
        {
          productName: 'South Indian Coffee Strong',
          src: require('../productImages/SIC_strong.jpg'),
        },
        {
          productName: 'Tea Milk',
          src: require('../productImages/tea_milk.jpeg'),
        },
        {
          productName: 'Tea Water',
          src: require('../productImages/tea_water.jpg'),
        },
        {
          productName: 'Lemon Tea',
          src: require('../productImages/lemon_tea.png'),
        },
      ],

      modalVisible: false,
      feedbackVisible: false,
      dispenseStatus:null,
      starCount:0
    };
  }

  

  async componentDidMount() {
    await this.sendFeedbackData();
    setTimeout(async () => {  
      this.setState({   
        splashScreenVisible : false   
      });   
    }, 3000);  
  }

  async componentWillUnmount() {
    console.log(await TestWifiModule.forgetNetwork());
  }

  sendFeedbackData = async () => {
    const netInfo = await NetInfo.fetch()
    console.log(netInfo.isInternetReachable)
    const storedValue = await AsyncStorage.getItem('name');//.then((value) => console.log(value))
    console.log(storedValue)
  }

  onConnect = async () =>{
    await this.askForUserPermissions();
    console.log('crossed permission access stage');
    TestWifiModule.isWifiTurnedOn()
      .then(async enabled => {
        if(! enabled){
          console.log(await TestWifiModule.turnOnWifi());
        }
        console.log(await TestWifiModule.connectToCoffeeMachine());
        setTimeout(async () => {
          console.log('Connection check');
          var temp = await TestWifiModule.isConnectedToGivenSSID();
          console.log(temp);
          if(temp) {
            console.log('true');
            var ip = await TestWifiModule.getDefaultGatewayIp();
            // eslint-disable-next-line no-bitwise
            var firstByte = ip & 255;
            // eslint-disable-next-line no-bitwise
            var secondByte = (ip >> 8) & 255;
            // eslint-disable-next-line no-bitwise
            var thirdByte = (ip >> 16) & 255;
            // eslint-disable-next-line no-bitwise
            var fourthByte = (ip >> 24) & 255;
            ipaddress =
              firstByte +
              '.' +
              secondByte +
              '.' +
              thirdByte +
              '.' +
              fourthByte;
            console.log(ipaddress);
            this.getProductInfo();
          } else {
            console.log('Connection to the coffee machine failed');
            console.log(await TestWifiModule.forgetNetwork());
            this.setState({isConnecting:false})
            Alert.alert('Info', 'Something Went Wrong...Please reconnect' , [
              {text: 'Okay'},
            ]);
          }
        }, 5000);
      })
      .catch(async e => {
        console.log(e);
        this.setState({isConnecting:false})
        Alert.alert('Info', 'Something Went Wrong...Please reconnect' , [
          {text: 'Okay'},
        ]);
      });
      //this.getProductInfo();

  }

  onDisconnect = async () => {
    this.setState({modalVisible:false,isConnected:false,deviceProductList:[],feedbackVisible:false});
    console.log(await TestWifiModule.forgetNetwork())
  }

  askForUserPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Wifi networks',
          message: 'We need your permission in order to find wifi networks',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Thank you for your permission! :)');
      } else {
        this.setState({isConnecting:false})
        Alert.alert('Info', 'Please provide location permission to access the app' , [
          {text: 'Okay'},
        ]);
      }
    } catch (err) {
      this.setState({isConnecting:false})
      console.warn(err);
      Alert.alert('Info', 'Please restart the app' , [
        {text: 'Close app', onPress: () => BackHandler.exitApp()},
      ]);
    }
  };

  getProductInfo = async () => {
    console.log('get Product Info');
    fetch('http://' + ipaddress + ':9876/getProductInfo',{
      headers:{
        tokenId:"secret",
      }
    })
      .then(response => response.json())
        .then(async resultData => {
          console.log(resultData)
          if (resultData.status === 'Success') {
            let deviceProductList = [];
            await resultData.data.map(async product => {
              let filterProduct = this.state.allProductListURL.find(
                allproduct => allproduct.productName === product.productName,
              );
              filterProduct.productId = product.productId;
              deviceProductList.push(filterProduct);
            });
            this.setState({
              deviceProductList: deviceProductList,
              isConnected: true,
              isConnecting:false,
            });
          } else {
            console.log(await TestWifiModule.forgetNetwork());
            this.setState({isConnecting:false})
            Alert.alert('Info', 'Something Went Wrong...Please reconnect' , [
              {text: 'Okay'},
            ]);
          }
        })
        .catch(async e => {
          console.log(await TestWifiModule.forgetNetwork());
          this.setState({isConnecting:false})
          Alert.alert('Info', "Network error...Please reconnect", [
            {text: 'Okay'},
          ]);
          console.log(e);
        });
  };

  waitForDispense = async (orderId) => {
    this.setState({orderReceived:true});
    this.intervalId = BackgroundTimer.setInterval(() => {
      fetch('http://' + ipaddress + ":9876/dispenseStatus?orderId=" + orderId,{
        headers:{
          'tokenId':"secret",
        }
      })
        .then(response => response.json())
        .then(async resultData =>{
          console.log(resultData);
          if(resultData.status === 'Success' && resultData.dispenseStatus === true){ 
            console.log('Dispensing Finished');
            this.setState({feedbackVisible:true,orderReceived:false,dispenseStatus:ORDER_DISPENSED});
            //Alert.alert('Success', 'Get Your Drink', [{text: 'Thanks'}]);
            BackgroundTimer.clearInterval(this.intervalId)
          }
          else{
            console.log("Yet to be dispensed");
          }
        })
        .catch(async e => {
          BackgroundTimer.clearInterval(this.intervalId)
          //alert('Unable to Dispense. Please Try Again or restart the app..!');
          this.setState({dispenseStatus:UNABLE_TO_DISPENSE});
        })
    }, 5000);
  };
  
  getDispense = async productId => {
    this.setState({dispenseStatus:ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE});
    console.log(productId);
    fetch('http://' + ipaddress + ':9876/dispenseProduct', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'tokenId':"secret",
      },
      body: JSON.stringify({
        productId: productId,
        customerName: 'Arun',
      }),
    })
      .then(response => response.json())
      .then(async resultData => {
        if (resultData.status === 'Success') {
          this.setState({dispenseStatus:ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE})
          console.log(resultData)
          console.log('ack');
          await this.waitForDispense(resultData.orderId);
        }
        else{
          this.setState({dispenseStatus:UNABLE_TO_DISPENSE})
        }
      })
      .catch(async e => {
        this.setState({dispenseStatus:UNABLE_TO_DISPENSE});
      });
  };

  onStarRatingPress(rating) {
    console.log(rating)
    this.setState({
      starCount: rating
    });
  }

  render() {  
    return (
      <ScrollView style={{flexGrow: 1}}>

        {/* Visible for 3 seconds only when app opens*/}
        {this.state.splashScreenVisible ? 
          <View style={styles.logoContainer}>
            <View>
              <Image
              style={styles.logo}
              source={require('../productImages/Lavazza.png')}
              />
            </View>
          </View>
        :null}

        {/* Visible only when app is not connected with the machine */}
        {(! this.state.isConnected) && (! this.state.splashScreenVisible) ?
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
            <View style={{}}>
              <Image
              style={{width:150,height:75}}
              source={require('../productImages/Lavazza.png')}
              />
            </View>
              <View style={{borderRadius: 125, overflow: 'hidden',marginTop:20}}>
                <Image
                  style={{width: 250, height: 250}}
                  source={require('../productImages/connect.gif')}
                />
              </View>
              {this.state.isConnecting ?
                <View style={{flexDirection: 'row',marginTop:20}}>
                  <ActivityIndicator size="small" color="#100A45" />
                  <Text style={{color:'#100A45',fontWeight:'bold'}}>Connecting...!</Text>
                </View> :
                <View style={{alignItems:'center', marginTop:20}}>
                  <TouchableHighlight underlayColor='#100A45' style={{width:100, height:40, borderRadius:5,backgroundColor:'#100A45',alignItems:'center',justifyContent:'center'}} onPress={() => {this.setState({isConnecting:true});this.onConnect();}}>
                    <Text style = {{color:'white'}}>
                      Connect
                    </Text>
                  </TouchableHighlight>
                </View>}
              {/*View style={{flexDirection: 'row'}}>
                <ActivityIndicator size="small" color="#b85400" />
                <Text style={styles.productName}>Connecting...!</Text>
              </View>*/}
            </View>
          </View>
          : null}

          {/* Visible when app connected to the machine */}
          {this.state.isConnected ? (
          <View style={{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#100A45',height:50}} >
            <View style={{marginLeft:35,justifyContent:'center'}}>
              <Text style={{color:'#ffffff',fontWeight:'bold',fontSize:20}}>Menu</Text>
            </View>
            <View style={{marginRight:20,justifyContent:'center'}}>
              <Icon name='menu' size={30} color='#ffffff' onPress={async()=>{console.log('pressed')}}/>
            </View>
          </View>
          ):null}
          {this.state.deviceProductList.map((product, index) => {
            return (
              <Card key={index}>
                <CardItem>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <View>
                      <Image style={{width:75,height:75,borderRadius:75/2}} source={product.src} />
                    </View>
                    <View
                      style={{
                        //marginTop: 'auto',
                        //marginBottom: 'auto',
                        justifyContent:'center',
                        //marginLeft: 10,
                        width: '50%',
                        
                      }}>
                      <Text style={styles.productName}>
                        {product.productName}
                      </Text>
                    </View>
                    <View style={{justifyContent:'center'}}>
                      <TouchableOpacity onPress={()=>{this.setState({ modalVisible: !this.state.modalVisible,selectedIndex: index,dispenseStatus:BEFORE_PLACING_ORDER,starCount:0});}}>
                        <Icon name="circle-with-plus" size={35} style={{color: '#100A45'}} />
                    </TouchableOpacity>
                    </View>
                  </View>
                </CardItem>
              </Card>
            );
          })}
          {this.state.deviceProductList.length > 0 ? (
            <Modal
              animationType="slide"
              visible={this.state.modalVisible}
              onRequestClose={async () => {
                if(this.state.dispenseStatus === ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE || this.state.dispenseStatus === ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE){
                  console.log("dispensing dont go back")
                }
                else if(this.state.dispenseStatus === ORDER_DISPENSED){
                  this.onDisconnect()
                }
                else{
                  this.setState({modalVisible: false,feedbackVisible:false});
                }
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View >
                    <Image style={{width:75,height:75,borderRadius:150/2}}
                      source={this.state.deviceProductList[this.state.selectedIndex].src}
                    />
                  </View>
                  <View style={{ marginTop: 'auto', marginBottom: 'auto',}}>
                    <Text style={styles.productName}>
                      {
                        this.state.deviceProductList[this.state.selectedIndex]
                          .productName
                      }
                    </Text>
                  </View>
                  <View style={{marginTop:20, justifyContent:'center',alignItems:'center'}}>
                    <Text style={{  color:'#6F6D6D',fontSize:10}}>Status</Text>
                    <Text style={{ marginTop:5, color:'#100A45',fontSize:13}}>{this.state.dispenseStatus}</Text>
                  </View>

                  {/* */}
                  {this.state.feedbackVisible ?
                    <View style={{marginTop:20,justifyContent:'center', alignItems:'center'}}>
                      <Text style={{ color:'#6F6D6D',fontSize:10}}>Feedback</Text>
                      <View style={{marginTop:5}}>
                       <StarRating
                          disabled={false}
                          maxStars={5}
                          starSize={35}
                          emptyStarColor='#6F6D6D'
                          fullStarColor='#100A45'
                          halfStarEnabled={false}
                          rating={this.state.starCount}
                          selectedStar={(rating) => this.onStarRatingPress(rating)}
                       />
                      </View>
                      <TouchableHighlight underlayColor='#100A45' style={{ marginTop:20, width:100, height:40, borderRadius:5,backgroundColor:'#100A45',alignItems:'center',justifyContent:'center'}} onPress={() => {this.onDisconnect();}}>
                       <Text style = {{color:'white'}}>
                        Done
                       </Text>
                      </TouchableHighlight>
                    </View>
                  : null}

                  { (this.state.dispenseStatus === BEFORE_PLACING_ORDER || this.state.dispenseStatus === UNABLE_TO_DISPENSE) ? 
                    <View style={{width: '100%',flexDirection: 'row',justifyContent: 'space-around',marginTop: 20,}}>
                      <Icon.Button
                        name="cross"
                        size={30}
                        color="white"
                        backgroundColor="#100A45"
                        onPress={async () => {
                          this.setState({
                            modalVisible: false,
                          });
                        }}>
                        Cancel
                      </Icon.Button>
                      <Ionicons.Button
                        name="ios-cafe"
                        size={30}
                        color="white"
                        backgroundColor="#100A45"  
                        onPress={async () => {
                          await this.getDispense(
                            this.state.deviceProductList[this.state.selectedIndex]
                              .productId,
                          );
                        }}>
                        Dispense
                      </Ionicons.Button>
                    </View> 
                  :null}
                </View>
              </View>
            </Modal>
        ) : null}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  logo:  
    {    
        width:200,
        height:100,
    },  
    logoContainer:{
      justifyContent: 'center',  
      alignItems: 'center',
      marginTop:'50%'
    },
  header: {
    height:50,
    justifyContent:'center',
    /*alignItems: 'center',*/
    backgroundColor: '#b85400'
    
  },
  headerText:{
    color:'#FFFFFF',
    fontWeight:'bold',
    marginLeft:50,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 50,
  },
  restrictedAccessButton: {
    justifyContent:'center',
    alignItems: 'center',
    
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productName: {
    textShadowColor: '#100A45',
    //textShadowOffset: {width: -1, height: 1},
    //textShadowRadius: 10,
    //fontFamily: 'TimesNewroman',
    fontSize: 15,
    fontWeight:'bold',
    //flexWrap: 'wrap',

    color: '#100A45',
  },
});

export default ProductList;



/*var value = {"jaskar":"value"}
    var temp = JSON.stringify(value)
    AsyncStorage.setItem('name', temp);

    <Modal animationType="slide" visible={this.state.isConnected}>
        
        </Modal>
    <TouchableOpacity
              style={{marginTop:0,marginBottom:0}}
              onPress={async () => {
                this.setState({
                  selectedIndex: index,
                });
                this.setState({modalVisible: !this.state.modalVisible});
              }}>
     <View style={{marginTop: 20}}>
                    {/*{this.state.orderReceived ? <Text style={styles.productName}>Order Received</Text> : null }
    
    */
    /* (this.state.dispenseStatus === ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE) || (this.state.dispenseStatus === ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE) ?
                  
                  <Image
                  style={{width:'100%',height:}}
                  source={require('../productImages/Cupshot3.jpg')}
                  /> : null
                  productId={
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId
                        }
                  
                  */