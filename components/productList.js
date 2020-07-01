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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import TestWifiModule from "./TestWifiModule";
import { Rating, AirbnbRating } from 'react-native-ratings';
import { TouchableOpacity } from 'react-native-gesture-handler';

// ORDER STATUS 
const BEFORE_PLACING_ORDER = 'Order your Beverage';
const ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE = 'Please wait..!!!';
const ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE = 'Order received Please wait..!!!';
const PLACE_THE_CUP = 'Please place the cup\nIf placed, click dispense';
const DISPENSING = 'Dispensing..!!!'
const ORDER_DISPENSED = 'Your Beverage dispensed..!!!';

// ORDEr ERROR STATUS
const ORDER_REQUEST_FAILED = 'Order request failed\nTry again or restart..!!!'
const DISPENSE_REQUEST_FAILED = 'Dispense request failed\nTimeout expired\nTry again or restart..!!!'
const TIMEOUT_EXPIRED = 'Timeout expired\nTry again or restart..!!!'
const ORDER_STATUS_REQUEST_FAILED = 'Getting order status failed\nTry again or restart..!!!'
const ORDER_CANCELLED_BY_SERVER = 'Order cancelled\nTry again..!!!'

var ipaddress = '192.168.5.1';
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected:false,
      splashScreenVisible:true,
      isConnecting:false,
      selectedIndex: 0,
      modalVisible: false,
      feedbackVisible: false,
      orderStatus:null,
      starCount:0,
      deviceProductList: [],
      orderId:null,
      timer:30,
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
    };
  }

  

  async componentDidMount() {
    await this.sendFeedbackData();
    setTimeout(async () => {  
      this.setState({   
        splashScreenVisible : false   
      });   
      await this.askForUserPermissions();
      console.log('crossed permission access stage');
    }, 3000);  
  }

  async componentWillUnmount() {
    console.log(await TestWifiModule.forgetNetwork());
  }

  sendFeedbackData = async () => {
    const netInfo = await NetInfo.fetch()
    console.log('Internet Connection :',netInfo.isInternetReachable)
    const storedValue = await AsyncStorage.getItem('name');//.then((value) => console.log(value))
    console.log('Data :', storedValue)
  }

  onConnect = async () =>{
    TestWifiModule.isWifiTurnedOn()
      .then(async enabled => {
        if(! enabled){
          console.log(await TestWifiModule.turnOnWifi());
        }
        console.log(await TestWifiModule.connectToCoffeeMachine());
        setTimeout(async () => {
          console.log('Connection check');
          if(await TestWifiModule.isConnectedToGivenSSID()) {
            console.log('true');
            var ip = await TestWifiModule.getDefaultGatewayIp();
            var firstByte = ip & 255;
            var secondByte = (ip >> 8) & 255;
            var thirdByte = (ip >> 16) & 255;
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
        console.log(await TestWifiModule.forgetNetwork());
        this.setState({isConnecting:false})
        Alert.alert('Info', 'Something Went Wrong...Please reconnect' , [
          {text: 'Okay'},
        ]);
      });
      //this.getProductInfo();

  }

  onDisconnect = async () => {
    this.setState({
      deviceProductList:[],
      isConnected:false})
    this.setState({
      modalVisible:false,
      feedbackVisible:false,
      selectedIndex:0,
      orderId:null,
      orderStatus:null,
      starCount:0});
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

  stopPoll = async () => {
    BackgroundTimer.clearInterval(this.intervalId)
  }

  startPoll = async () => {
    this.intervalId = BackgroundTimer.setInterval(() => {
      fetch('http://' + ipaddress + ":9876/orderStatus?orderId=" + this.state.orderId,{
        headers:{
          'tokenId':"secret",
        }
      })
        .then(response => response.json())
        .then(async resultData =>{
          console.log(resultData);
          if(resultData.status === 'Success'){
            if(resultData.orderStatus === 'InQueue'){ 
              console.log('In-Queue')
              console.log('Continue poll')
            }
            else if(resultData.orderStatus === 'WaitingToDispense'){
              this.stopPoll()
              console.log('WaitingToDispense');
              console.log('Stopped poll for user to place the cup');
              this.setState({orderStatus:PLACE_THE_CUP})
              console.log(this.state.orderStatus)
              //var orderId=this.state.orderId
              this.timer = BackgroundTimer.setInterval(async () => {
                this.setState({timer:(this.state.timer-1)})
                console.log(this.state.timer)
                if(this.state.timer === 0){
                  BackgroundTimer.clearInterval(this.timer)
                  this.setState({timer:30})
                  this.setState({orderStatus:TIMEOUT_EXPIRED,orderId:null})
                }
              },1000)
            }
            else if(resultData.orderStatus === 'Dispensing'){
              console.log('Dispensing')
              console.log('Continue poll')
            }
            else if(resultData.orderStatus === 'Dispensed'){
              console.log('Dispensed')
              this.setState({feedbackVisible:true,orderStatus:ORDER_DISPENSED,orderId:null});
              this.stopPoll()
            }
            else if(resultData.orderStatus === 'Cancelled'){
              console.log('cancelled by server')
              this.setState({orderStatus:ORDER_CANCELLED_BY_SERVER,orderId:null})
            }
          }
          else{
            this.stopPoll()
            this.setState({orderStatus:ORDER_STATUS_REQUEST_FAILED,orderId:null});
          }
          console.log(this.state.orderStatus)
        })
        .catch(async e => {
          this.stopPoll()
          this.setState({orderStatus:ORDER_STATUS_REQUEST_FAILED,orderId:null});
        })
    }, 5000);
  }
  
  placeOrder = async productId => {
    this.setState({orderStatus:ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE});
    console.log(productId);
    fetch('http://' + ipaddress + ':9876/order', {
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
          this.setState({orderStatus:ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE})
          console.log(resultData)
          console.log('ack');
          this.state.orderId = resultData.orderId
          await this.startPoll();
        }
        else{
          this.setState({orderStatus:ORDER_REQUEST_FAILED})
        }
      })
      .catch(async e => {
        this.setState({orderStatus:ORDER_REQUEST_FAILED});
      });
  };

  startDispense = async () => {
    BackgroundTimer.clearInterval(this.timer)
    this.setState({timer:30})
    this.setState({ orderStatus:DISPENSING})
    fetch('http://' + ipaddress + ":9876/dispense?orderId=" + this.state.orderId,{
        headers:{
          'tokenId':"secret",
        }
      })
        .then(response => response.json())
        .then(async resultData =>{
          console.log(resultData)
          if (resultData.status === 'Success'){
            console.log("Dispense Starts")
            this.startPoll()
          }
          else{
            this.setState({orderStatus:DISPENSE_REQUEST_FAILED,orderId:null});
          }
        })
        .catch(async e => {
          this.setState({orderStatus:DISPENSE_REQUEST_FAILED,orderId:null});
        });
  }

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
              <Image
              style={styles.logo}
              source={require('../productImages/Lavazza.png')}
              />
          </View>
        :null}

        {/* Visible only when app is not connected with the machine */}
        <Modal onRequestClose={() => {BackHandler.exitApp()}} visible={(!this.state.isConnected) && (! this.state.splashScreenVisible)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Image
              style={{width:150,height:75}}
              source={require('../productImages/Lavazza.png')}
              />
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
            </View>
          </View>
        </Modal>

        {/* Visible when app connected to the machine */}
        {this.state.isConnected ? (
        <View style={{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#100A45',height:50}} >
          <View style={{marginLeft:35,justifyContent:'center'}}>
            <Text style={{color:'#ffffff',fontWeight:'bold',fontSize:15}}>Menu</Text>
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
                    <TouchableOpacity onPress={()=>{this.setState({ modalVisible: !this.state.modalVisible,selectedIndex: index,orderStatus:BEFORE_PLACING_ORDER,starCount:0});}}>
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
              if(this.state.orderStatus === ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE 
                || this.state.orderStatus === ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE
                || this.state.orderStatus === PLACE_THE_CUP
                || this.state.orderStatus === DISPENSING){
                console.log("Please dont go back")
              }
              else if(this.state.orderStatus === ORDER_DISPENSED){
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
                  <Text style={{ marginTop:5, color:'#100A45',fontSize:13}}>{this.state.orderStatus}</Text>
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

                {this.state.orderStatus === PLACE_THE_CUP ?
                <View style={{}}>
                  <View style={{marginTop:20,alignItems:'center',justifyContent:'center'}}>
                    <Ionicons.Button
                      name="ios-cafe"
                      size={30}
                      color="white"
                      backgroundColor="#100A45"  
                      onPress={async () => {
                        this.startDispense()
                      }}>
                      Dispense
                    </Ionicons.Button>
                  </View>
                  <View style={{marginTop:20,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{fontSize:10,fontFamily:'',color:'#6F6D6D'}}>Timeout: {this.state.timer}</Text>
                  </View>
                </View>
                : null}

                { (this.state.orderStatus === BEFORE_PLACING_ORDER 
                || this.state.orderStatus === ORDER_REQUEST_FAILED
                || this.state.orderStatus === ORDER_STATUS_REQUEST_FAILED
                || this.state.orderStatus === DISPENSE_REQUEST_FAILED
                || this.state.orderStatus === ORDER_CANCELLED_BY_SERVER
                || this.state.orderStatus === TIMEOUT_EXPIRED) ? 
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
                    <MaterialCommunityIcons.Button
                      name="hand-pointing-up"
                      size={30}
                      color="white"
                      backgroundColor="#100A45"  
                      onPress={async () => {
                        await this.placeOrder(
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId,
                        );
                      }}>
                      Order
                    </MaterialCommunityIcons.Button>
                  </View> 
                :null}
                { (this.state.orderStatus === ORDER_REQUEST_FAILED
                || this.state.orderStatus === ORDER_STATUS_REQUEST_FAILED
                || this.state.orderStatus === DISPENSE_REQUEST_FAILED
                || this.state.orderStatus === ORDER_CANCELLED_BY_SERVER
                || this.state.orderStatus === TIMEOUT_EXPIRED) ? 
                  <View style={{width: '50%',justifyContent: 'center',marginTop: 20,}}>
                    <MaterialCommunityIcons.Button
                      name="reload"
                      size={30}
                      color="white"
                      backgroundColor="#100A45"
                      onPress={async () => {
                        this.onDisconnect();
                      }}>
                      Restart
                    </MaterialCommunityIcons.Button>
                  </View> 
                :null}
              </View>
            </View>
          </Modal>
        ) : null}
        {/*<Modal animationType='slide' visible={this.state.orderStatus===DISPENSING} onRequestClose={()=>{console.log('do nothing');}}>
          
            <Image style ={{flex:1,alignSelf:'stretch',width:null,height:null}} source={require('../productImages/Cupshot3.jpg')}/>
        
                    </Modal>*/}
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
      //flex:1,
      justifyContent: 'center', 
      marginTop: "50%", 
      alignItems: 'center',
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
   /*{(! this.state.isConnected) && (! this.state.splashScreenVisible) ?*/    /* (this.state.orderStatus === ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE) || (this.state.orderStatus === ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE) ?
                  
                  <Image
                  style={{width:'100%',height:}}
                  source={require('../productImages/Cupshot3.jpg')}
                  /> : null
                  productId={
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId
                        }
                  
                  */
                 /*<TouchableHighlight underlayColor='#100A45' style={{ marginTop:20, width:120, height:40, borderRadius:5,backgroundColor:'#100A45',alignItems:'center',justifyContent:'center'}} onPress={() => {this.startDispense();}}>
                  <Text style = {{color:'white'}}>
                    Dispense
                  </Text>
                    </TouchableHighlight> */