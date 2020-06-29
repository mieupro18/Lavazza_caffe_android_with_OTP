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
import Icon from 'react-native-vector-icons/Feather';
import TestWifiModule from "./TestWifiModule";
import { Rating, AirbnbRating } from 'react-native-ratings';

var ipaddress = '192.168.5.1';
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading:true,
      splashScreenVisible:true,
      isConnecting:false,
      selectedIndex: 0,
      deviceProductList: [],
      isDispensing: false,
      orderReceived:false,
      allProductListURL: [
        {
          productName: 'Cappuccino',
          src: require('../productImages/product1.png'),
        },
        {
          productName: 'Espresso',
          src: require('../productImages/product2.png'),
        },
        {
          productName: 'Milk',
          src: require('../productImages/product3.png'),
        },
        {
          productName: 'South Indian Coffee Light',
          src: require('../productImages/product4.png'),
        },
        {
          productName: 'South Indian Coffee Strong',
          src: require('../productImages/product5.png'),
        },
        {
          productName: 'Tea Milk',
          src: require('../productImages/product6.png'),
        },
        {
          productName: 'Tea Water',
          src: require('../productImages/product7.png'),
        },
        {
          productName: 'Lemon Tea',
          src: require('../productImages/product8.png'),
        },
      ],
      starCount:0,
      modalVisible: false,
      feedbackVisible: false,
    };
  }

  sendFeedbackData = async () => {
    const netInfo = await NetInfo.fetch()
    console.log(netInfo.isInternetReachable)
    const storedValue = await AsyncStorage.getItem('name');//.then((value) => console.log(value))
    console.log(storedValue)
  }

   

  async componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    
    //AppState.addEventListener("change", this._handleAppStateChange.bind(this))
    await this.sendFeedbackData();
    //this.setState({isLoading: true});
    setTimeout(async () => {  
      this.setState({   
        splashScreenVisible : false   
      });   
    }, 3000);  
    //this.Hide_Splash_Screen
    //this.getProductInfo();
    /*await this.askForUserPermissions();
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
            Alert.alert('Info', 'Connection to the coffee machine failed' , [
              {text: 'Close App', onPress: () => BackHandler.exitApp()},
            ]);
          }
        }, 5000);
      })
      .catch(async e => {
        console.log(e);
        Alert.alert('Info', 'Something Went Wrong...Please restart the app' , [
          {text: 'Close App', onPress: () => BackHandler.exitApp()},
        ]);
      });*/
  }

  async componentWillUnmount() {
    console.log(await TestWifiModule.forgetNetwork());
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
            Alert.alert('Info', 'Connection to the coffee machine failed' , [
              {text: 'Okay'},
            ]);
          }
        }, 5000);
      })
      .catch(async e => {
        console.log(e);
        Alert.alert('Info', 'Something Went Wrong...Please restart the app' , [
          {text: 'Close App', onPress: () => BackHandler.exitApp()},
        ]);
      });

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
        BackHandler.exitApp();
        console.log('You will not able to retrieve wifi available networks list');
      }
    } catch (err) {
      console.warn(err);
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
              isLoading: false,
              isConnecting:false,
            });
          } else {
            console.log(await TestWifiModule.forgetNetwork());
            this.setState({isConnecting:false})
            Alert.alert('Info', 'Something Went Wrong...Please reconnect' , [
              {text: 'Okay'},
            ]);
            //this.setState({isLoading: false});
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
            this.setState({isDispensing: false,feedbackVisible:true,orderReceived:false});
            Alert.alert('Success', 'Get Your Drink', [{text: 'Thanks'}]);
            BackgroundTimer.clearInterval(this.intervalId)
          }
          else{
            console.log("Yet to be dispensed");
          }
        })
        .catch(async e => {
          alert('Unable to Dispense. Please Try Again or restart the app..!');
          this.setState({isDispensing: false});
        })
    }, 5000);
  };

  getDispense = async productId => {
    this.setState({isDispensing: true});
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
          console.log(resultData)
          console.log('ack');
          await this.waitForDispense(resultData.orderId);
        }
      })
      .catch(async e => {
        alert('Unable to Dispense. Please Try Again or restart the app..!');
        this.setState({isDispensing: false});
      });
  };

  async ratingCompleted( rating ) {
    console.log(rating);
  }

  render() {  
    return (
      <ScrollView style={{flexGrow: 1}}>
        {this.state.isLoading ? null : (
          <View style={{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#100A45',height:50}} >
            <View style={{marginLeft:20,justifyContent:'center'}}>
            <Text style={{color:'#ffffff',fontWeight:'bold',size:30}}>Menu</Text>
            </View>
            <View style={{marginRight:20,justifyContent:'center'}}>
              <Icon name='menu' size={30} color='#ffffff' onPress={()=>{console.log('pressed')}}/>
            </View>
          </View>
          )}
        {this.state.deviceProductList.map((product, index) => {
          return (
            <TouchableHighlight
              onPress={async () => {
                this.setState({
                  selectedIndex: index,
                });
                this.setState({modalVisible: !this.state.modalVisible});
              }}>
              <Card key={index}>
                <CardItem>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <View>
                      <Image source={product.src} />
                    </View>
                    <View
                      style={{
                        marginTop: 'auto',
                        marginBottom: 'auto',
                        width: '50%',
                        marginLeft: '10%',
                      }}>
                      <Text style={styles.productName}>
                        {product.productName}
                      </Text>
                    </View>
                    <View>
                      <Button transparent>
                        <Icon name="heart" style={{color: 'brown'}} />
                      </Button>
                    </View>
                  </View>
                </CardItem>
              </Card>
            </TouchableHighlight>
          );
        })}
        {this.state.deviceProductList.length > 0 ? (
          <Modal
            animationType="slide"
            visible={this.state.modalVisible}
            onRequestClose={async () => {
              if(this.state.isDispensing === true){
                console.log("dispensing dont go back")
              }
              else{
              this.setState({modalVisible: false,starCount:0,feedbackVisible:false});
              }
              // Alert.alert('Modal has been closed.');
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View>
                  <Image
                    source={
                      this.state.deviceProductList[this.state.selectedIndex].src
                    }
                  />
                </View>
                
                <View
                  style={{
                    marginTop: 'auto',
                    marginBottom: 'auto',
                  }}>
                  <Text style={styles.productName}>
                    {
                      this.state.deviceProductList[this.state.selectedIndex]
                        .productName
                    }
                  </Text>
                </View>
                {this.state.isDispensing ? (
                 
                    <View style={{flexDirection:'row', marginTop: 20}}>
                      <ActivityIndicator size="small" color="#b85400" />
                      <Text style={styles.productName}>Please wait...!</Text>
                    </View>
                ) : (
                <View style={{marginTop: 20}}>
                    {this.state.feedbackVisible ?
                    <AirbnbRating
                    count={5}
                    reviews={["Terrible", "Bad", "OK", "Good", "Amazing"]}
                    showRating={false}
                    defaultRating={0}
                    onFinishRating={this.ratingCompleted}
                    size={30}
                    /> : null}
                    <View
                      style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        marginTop: 20,
                      }}>
                      <Icon.Button
                        name="x"
                        size={30}
                  
                        color="black"
                        backgroundColor="#f1f2f6"
                        onPress={async () => {
                          this.setState({
                            modalVisible: false,
                            starCount:0,
                            feedbackVisible:false,
                          });
                        }}>
                        Cancel
                      </Icon.Button>

                      <Icon.Button
                        disabled={this.state.isDispensing}
                        name="coffee"
                      
                        size={30}
                        color="white"
                        backgroundColor="#b85400"
                        productId={
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId
                        }
                        onPress={async () => {
                          await this.getDispense(
                            this.state.deviceProductList[this.state.selectedIndex]
                              .productId,
                          );
                        }}>
                        Order
                      </Icon.Button>
                    </View>
                </View>
                )}
              </View>
            </View>
          </Modal>
        ) : null}
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
        {/*<Modal animationType="slide" visible={this.state.isLoading}>*/}
        {(this.state.isLoading) && (! this.state.splashScreenVisible) ?
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
          :null}
        {/*</Modal>*/}
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
    textShadowColor: '#cc8e35',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    fontFamily: 'LittleLord',
    fontSize: 36,
    flexWrap: 'wrap',
    color: '#000',
  },
});

export default ProductList;



/*var value = {"jaskar":"value"}
    var temp = JSON.stringify(value)
    AsyncStorage.setItem('name', temp);
    
     <View style={{marginTop: 20}}>
                    {/*{this.state.orderReceived ? <Text style={styles.productName}>Order Received</Text> : null }
    
    */