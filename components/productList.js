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
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundTimer from 'react-native-background-timer';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TestWifiModule from './TestWifiModule';
import {TouchableOpacity} from 'react-native-gesture-handler';
//import {fetch} from 'react-native-ssl-pinning';

// ORDER STATUS
const BEFORE_PLACING_ORDER = 'Order your Beverage';
const ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE = 'Please wait..!!!';
const ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE =
  'Order received Please wait..!!!';
const PLACE_THE_CUP = 'Please place the cup\nIf placed, click dispense';
const DISPENSING = 'Dispensing..!!!';
const ORDER_DISPENSED = 'Your Beverage dispensed..!!!';

// ORDER ERROR STATUS
const ORDER_REQUEST_FAILED = 'Order request failed\nTry again or restart..!!!';
const DISPENSE_REQUEST_FAILED =
  'Dispense request failed\nTimeout expired\nTry again or restart..!!!';
const TIMEOUT_EXPIRED = 'Timeout expired\nTry again or restart..!!!';
const ORDER_STATUS_REQUEST_FAILED =
  'Getting order status failed\nTry again or restart..!!!';
const ORDER_CANCELLED_BY_SERVER = 'Order cancelled\nTry again..!!!';

var ipaddress = '';
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      modalVisible: false,
      feedbackVisible: false,
      orderStatus: null,
      starCount: 0,
      deviceProductList: [],
      orderId: null,
      timer: 30,
      backgroundInactivityTimer: false,
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
    //console.log('hi',this.props.route.params.name);
    AppState.addEventListener('change', this._handleAppStateChange);
    this.showProductList(this.props.route.params.productList);
  }

  async componentWillUnmount() {
    this.disconnectFromMachine();
  }

  _handleAppStateChange = async state => {
    if (state === 'background') {
      console.log(state);
      this.backgroundInactivityTimer = BackgroundTimer.setTimeout(async () => {
        console.log('Disconnect from background');
        this.disconnectFromMachine();
        this.props.navigation.goBack();
        this.setState({backgroundInactivityTimer: false});
      }, 5000);
      this.setState({backgroundInactivityTimer: true});
      console.log('Timeron :', this.state.backgroundInactivityTimer);
    } else if (state === 'active') {
      console.log(state);
      console.log('Timeron :', this.state.backgroundInactivityTimer);
      if (this.state.backgroundInactivityTimer === true) {
        BackgroundTimer.clearTimeout(this.backgroundInactivityTimer);
        this.setState({backgroundInactivityTimer: false});
        console.log('Timeron :', this.state.backgroundInactivityTimer);
      }
    }
  };

  disconnectFromMachine = async () => {
    AppState.removeEventListener('change', this._handleAppStateChange);
    if (TestWifiModule.isConnectedToGivenSSID()) {
      console.log(
        'Disconnect from machine',
        await TestWifiModule.forgetNetwork(),
      );
    }
  };

  showProductList = async produtList => {
    console.log('show Product list');
    let deviceProductList = [];
    await produtList.map(async product => {
      let filterProduct = this.state.allProductListURL.find(
        allproduct => allproduct.productName === product.productName,
      );
      filterProduct.productId = product.productId;
      deviceProductList.push(filterProduct);
    });
    this.setState({
      deviceProductList: deviceProductList,
    });
  };

  checkForFeedbackVisibility = async productName => {
    var feedbackTimeDetails = JSON.parse(
      await AsyncStorage.getItem(productName),
    );
    console.log(feedbackTimeDetails);
    if (feedbackTimeDetails === null) {
      feedbackTimeDetails = {
        lastFeedbackDisplayedTime: Date.parse(new Date()),
        nextFeedbackInterval: 60000,
      };
      await AsyncStorage.setItem(
        productName,
        JSON.stringify(feedbackTimeDetails),
      );
      console.log(await AsyncStorage.getItem(productName));
      return false;
    }
    const currentTime = Date.parse(new Date());
    console.log(currentTime);
    if (
      currentTime - feedbackTimeDetails.lastFeedbackDisplayedTime >
      feedbackTimeDetails.nextFeedbackInterval
    ) {
      feedbackTimeDetails.lastFeedbackDisplayedTime = currentTime;
      feedbackTimeDetails.nextFeedbackInterval = 120000;
      await AsyncStorage.setItem(
        productName,
        JSON.stringify(feedbackTimeDetails),
      );
      console.log(await AsyncStorage.getItem(productName));
      return true;
    } else {
      return false;
    }
  };

  stopPollForOrderStatus = async () => {
    BackgroundTimer.clearInterval(this.pollingIntervalId);
  };

  startPollForOrderStatus = async productName => {
    this.pollingIntervalId = BackgroundTimer.setInterval(() => {
      fetch(
        'http://192.168.5.1:9876/orderStatus?orderId=' + this.state.orderId,
        {
          headers: {
            tokenId: 'secret',
          },
        },
      )
        .then(response => response.json())
        .then(async resultData => {
          console.log(resultData);
          if (resultData.status === 'Success') {
            if (resultData.orderStatus === 'InQueue') {
              console.log('In-Queue');
              console.log('Continue poll');
            } else if (resultData.orderStatus === 'WaitingToDispense') {
              this.stopPollForOrderStatus();
              console.log('WaitingToDispense');
              console.log('Stopped poll for user to place the cup');
              this.setState({orderStatus: PLACE_THE_CUP});
              console.log(this.state.orderStatus);
              this.timer = BackgroundTimer.setInterval(async () => {
                this.setState({timer: this.state.timer - 1});
                console.log(this.state.timer);
                if (this.state.timer === 0) {
                  BackgroundTimer.clearInterval(this.timer);
                  this.setState({timer: 30});
                  this.setState({orderStatus: TIMEOUT_EXPIRED, orderId: null});
                }
              }, 1000);
            } else if (resultData.orderStatus === 'Dispensing') {
              console.log('Dispensing');
              console.log('Continue poll');
            } else if (resultData.orderStatus === 'Dispensed') {
              console.log('Dispensed');
              this.disconnectFromMachine();
              if (await this.checkForFeedbackVisibility(productName)) {
                console.log('feedback visible');
                this.setState({
                  feedbackVisible: true,
                });
              }
              this.setState({
                orderStatus: ORDER_DISPENSED,
                orderId: null,
              });
              this.stopPollForOrderStatus();
            } else if (resultData.orderStatus === 'Cancelled') {
              console.log('cancelled by server');
              this.setState({
                orderStatus: ORDER_CANCELLED_BY_SERVER,
                orderId: null,
              });
            }
          } else {
            this.stopPollForOrderStatus();
            this.setState({
              orderStatus: ORDER_STATUS_REQUEST_FAILED,
              orderId: null,
            });
          }
          console.log(this.state.orderStatus);
        })
        .catch(async e => {
          this.stopPollForOrderStatus();
          this.setState({
            orderStatus: ORDER_STATUS_REQUEST_FAILED,
            orderId: null,
          });
        });
    }, 5000);
  };

  placeOrder = async (productId, productName) => {
    this.setState({
      orderStatus: ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE,
    });
    console.log(productId);
    fetch('http://192.168.5.1:9876/order', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        tokenId: 'secret',
      },
      body: JSON.stringify({
        productId: productId,
        customerName: 'Arun',
      }),
    })
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          this.setState({
            orderStatus: ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
          });
          console.log(resultData);
          console.log('ack');
          this.state.orderId = resultData.orderId;
          await this.startPollForOrderStatus(productName);
        } else {
          this.setState({orderStatus: ORDER_REQUEST_FAILED});
        }
      })
      .catch(async e => {
        console.log(e);
        this.setState({orderStatus: ORDER_REQUEST_FAILED});
      });
  };

  startDispense = async productName => {
    BackgroundTimer.clearInterval(this.timer);
    this.setState({timer: 30});
    this.setState({orderStatus: DISPENSING});
    fetch('http://192.168.5.1:9876/dispense?orderId=' + this.state.orderId, {
      headers: {
        tokenId: 'secret',
      },
    })
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          console.log('Dispense Starts');
          this.startPollForOrderStatus(productName);
        } else {
          this.setState({orderStatus: DISPENSE_REQUEST_FAILED, orderId: null});
        }
      })
      .catch(async e => {
        this.setState({orderStatus: DISPENSE_REQUEST_FAILED, orderId: null});
      });
  };

  async onStarRatingPress(rating, productName) {
    console.log(rating);
    this.setState({
      starCount: rating,
    });
    var feedbackData = JSON.parse(await AsyncStorage.getItem('feedbackData'));
    if (feedbackData === null) {
      console.log('null');
      feedbackData = {};
    }
    feedbackData[productName] = {
      rating: rating,
      timeStamp: Date.parse(new Date()),
      machineName: 'machine1',
    };
    AsyncStorage.setItem('feedbackData', JSON.stringify(feedbackData));
    console.log(await AsyncStorage.getItem('feedbackData'));
  }

  render() {
    return (
      <ScrollView style={{flexGrow: 1}}>
        <View
          style={{
            backgroundColor: '#100A45',
            height: 50,

            justifyContent:'center',
            
          }}>
          <Text
            style={{
              color: '#ffffff',
              fontWeight: 'bold',
              marginLeft:50,
              fontSize: 15,
            }}>
            LAVAZZA
          </Text>
        </View>
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
                    <Image
                      style={{width: 75, height: 75, borderRadius:20}}
                      source={product.src}
                    />
                  </View>
                  <View
                    style={{
                      //marginTop: 'auto',
                      //marginBottom: 'auto',
                      justifyContent: 'center',
                      //marginLeft: 10,
                      width: '50%',
                    }}>
                    <Text style={styles.productName}>
                      {product.productName}
                    </Text>
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          modalVisible: !this.state.modalVisible,
                          selectedIndex: index,
                          orderStatus: BEFORE_PLACING_ORDER,
                          starCount: 0,
                        });
                      }}>
                      <Icon
                        name="circle-with-plus"
                        size={35}
                        style={{color: '#100A45'}}
                      />
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
              if (
                this.state.orderStatus ===
                  ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE ||
                this.state.orderStatus ===
                  ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE ||
                this.state.orderStatus === PLACE_THE_CUP ||
                this.state.orderStatus === DISPENSING
              ) {
                console.log('Please dont go back');
              } else if (this.state.orderStatus === ORDER_DISPENSED) {
                this.disconnectFromMachine();
              } else {
                this.setState({modalVisible: false, feedbackVisible: false});
              }
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View>
                  <Image
                    style={{width: 75, height: 75, borderRadius: 150 / 2}}
                    source={
                      this.state.deviceProductList[this.state.selectedIndex].src
                    }
                  />
                </View>
                <View style={{marginTop: 'auto', marginBottom: 'auto'}}>
                  <Text style={styles.productName}>
                    {
                      this.state.deviceProductList[this.state.selectedIndex]
                        .productName
                    }
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text style={{color: '#6F6D6D', fontSize: 10}}>Status</Text>
                  <Text style={{marginTop: 5, color: '#100A45', fontSize: 13}}>
                    {this.state.orderStatus}
                  </Text>
                </View>

                {/* */}
                {this.state.feedbackVisible ? (
                  <View
                    style={{
                      marginTop: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: '#6F6D6D', fontSize: 10}}>
                      Feedback
                    </Text>
                    <View style={{marginTop: 5}}>
                      <StarRating
                        disabled={false}
                        maxStars={5}
                        starSize={35}
                        emptyStarColor="#6F6D6D"
                        fullStarColor="#100A45"
                        halfStarEnabled={false}
                        rating={this.state.starCount}
                        selectedStar={rating =>
                          this.onStarRatingPress(
                            rating,
                            this.state.deviceProductList[
                              this.state.selectedIndex
                            ].productName,
                          )
                        }
                      />
                    </View>
                  </View>
                ) : null}
                {this.state.orderStatus === ORDER_DISPENSED ? (
                  <TouchableHighlight
                    underlayColor="#100A45"
                    style={{
                      marginTop: 20,
                      width: 100,
                      height: 40,
                      borderRadius: 5,
                      backgroundColor: '#100A45',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      this.props.navigation.goBack();
                    }}>
                    <Text style={{color: 'white'}}>Done</Text>
                  </TouchableHighlight>
                ) : null}

                {this.state.orderStatus === PLACE_THE_CUP ? (
                  <View style={{}}>
                    <View
                      style={{
                        marginTop: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Ionicons.Button
                        name="ios-cafe"
                        size={30}
                        color="white"
                        backgroundColor="#100A45"
                        onPress={async () => {
                          this.startDispense(
                            this.state.deviceProductList[
                              this.state.selectedIndex
                            ].productName,
                          );
                        }}>
                        Dispense
                      </Ionicons.Button>
                    </View>
                    <View
                      style={{
                        marginTop: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: '',
                          color: '#6F6D6D',
                        }}>
                        Timeout: {this.state.timer}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {this.state.orderStatus === BEFORE_PLACING_ORDER ||
                this.state.orderStatus === ORDER_REQUEST_FAILED ||
                this.state.orderStatus === ORDER_STATUS_REQUEST_FAILED ||
                this.state.orderStatus === DISPENSE_REQUEST_FAILED ||
                this.state.orderStatus === ORDER_CANCELLED_BY_SERVER ||
                this.state.orderStatus === TIMEOUT_EXPIRED ? (
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      marginTop: 20,
                    }}>
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
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productName,
                        );
                      }}>
                      Order
                    </MaterialCommunityIcons.Button>
                  </View>
                ) : null}
                {this.state.orderStatus === ORDER_REQUEST_FAILED ||
                this.state.orderStatus === ORDER_STATUS_REQUEST_FAILED ||
                this.state.orderStatus === DISPENSE_REQUEST_FAILED ||
                this.state.orderStatus === ORDER_CANCELLED_BY_SERVER ||
                this.state.orderStatus === TIMEOUT_EXPIRED ? (
                  <View
                    style={{
                      width: '50%',
                      justifyContent: 'center',
                      marginTop: 20,
                    }}>
                    <MaterialCommunityIcons.Button
                      name="reload"
                      size={30}
                      color="white"
                      backgroundColor="#100A45"
                      onPress={async () => {
                        await this.disconnectFromMachine();
                        this.props.navigation.goBack();
                      }}>
                      Restart
                    </MaterialCommunityIcons.Button>
                  </View>
                ) : null}
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
  logo: {
    width: 200,
    height: 100,
  },
  logoContainer: {
    //flex:1,
    justifyContent: 'center',
    marginTop: '50%',
    alignItems: 'center',
  },
  header: {
    height: 50,
    justifyContent: 'center',
    /*alignItems: 'center',*/
    backgroundColor: '#b85400',
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 50,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 50,
  },
  restrictedAccessButton: {
    justifyContent: 'center',
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
    fontWeight: 'bold',
    //flexWrap: 'wrap',

    color: '#100A45',
  },
});

export default ProductList;

/* (this.state.orderStatus === ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE) || (this.state.orderStatus === ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE) ?
                  <Image
                  style={{width:'100%',height:}}
                  source={require('../productImages/Cupshot3.jpg')}
                  /> : null
                  productId={
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId
                        }

                  */

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
/*{(! this.state.isConnected) && (! this.state.splashScreenVisible) ?*/

/*<Image
                  style={{width:'100%',height:}}
                  source={require('../productImages/Cupshot3.jpg')}
                  /> : null
                  productId={
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId
                        }
-----BEGIN CERTIFICATE-----
MIIEkjCCA3qgAwIBAgIQCgFBQgAAAVOFc2oLheynCDANBgkqhkiG9w0BAQsFADA/
MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT
DkRTVCBSb290IENBIFgzMB4XDTE2MDMxNzE2NDA0NloXDTIxMDMxNzE2NDA0Nlow
SjELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUxldCdzIEVuY3J5cHQxIzAhBgNVBAMT
GkxldCdzIEVuY3J5cHQgQXV0aG9yaXR5IFgzMIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEAnNMM8FrlLke3cl03g7NoYzDq1zUmGSXhvb418XCSL7e4S0EF
q6meNQhY7LEqxGiHC6PjdeTm86dicbp5gWAf15Gan/PQeGdxyGkOlZHP/uaZ6WA8
SMx+yk13EiSdRxta67nsHjcAHJyse6cF6s5K671B5TaYucv9bTyWaN8jKkKQDIZ0
Z8h/pZq4UmEUEz9l6YKHy9v6Dlb2honzhT+Xhq+w3Brvaw2VFn3EK6BlspkENnWA
a6xK8xuQSXgvopZPKiAlKQTGdMDQMc2PMTiVFrqoM7hD8bEfwzB/onkxEz0tNvjj
/PIzark5McWvxI0NHWQWM6r6hCm21AvA2H3DkwIDAQABo4IBfTCCAXkwEgYDVR0T
AQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAYYwfwYIKwYBBQUHAQEEczBxMDIG
CCsGAQUFBzABhiZodHRwOi8vaXNyZy50cnVzdGlkLm9jc3AuaWRlbnRydXN0LmNv
bTA7BggrBgEFBQcwAoYvaHR0cDovL2FwcHMuaWRlbnRydXN0LmNvbS9yb290cy9k
c3Ryb290Y2F4My5wN2MwHwYDVR0jBBgwFoAUxKexpHsscfrb4UuQdf/EFWCFiRAw
VAYDVR0gBE0wSzAIBgZngQwBAgEwPwYLKwYBBAGC3xMBAQEwMDAuBggrBgEFBQcC
ARYiaHR0cDovL2Nwcy5yb290LXgxLmxldHNlbmNyeXB0Lm9yZzA8BgNVHR8ENTAz
MDGgL6AthitodHRwOi8vY3JsLmlkZW50cnVzdC5jb20vRFNUUk9PVENBWDNDUkwu
Y3JsMB0GA1UdDgQWBBSoSmpjBH3duubRObemRWXv86jsoTANBgkqhkiG9w0BAQsF
AAOCAQEA3TPXEfNjWDjdGBX7CVW+dla5cEilaUcne8IkCJLxWh9KEik3JHRRHGJo
uM2VcGfl96S8TihRzZvoroed6ti6WqEBmtzw3Wodatg+VyOeph4EYpr/1wXKtx8/
wApIvJSwtmVi4MFU5aMqrSDE6ea73Mj2tcMyo5jMd6jmeWUHK8so/joWUoHOUgwu
X4Po1QYz+3dszkDqMp4fklxBwXRsW10KXzPMTZ+sOPAveyxindmjkW8lGy+QsRlG
PfZ+G6Z6h7mjem0Y+iWlkYcV4PIWL1iwBi8saCbGS5jN2p8M+X+Q7UNKEkROb3N6
KOqkqm57TH2H3eDJAkSnh6/DNFu0Qg==
-----END CERTIFICATE-----

                  */
/*<TouchableHighlight underlayColor='#100A45' style={{ marginTop:20, width:120, height:40, borderRadius:5,backgroundColor:'#100A45',alignItems:'center',justifyContent:'center'}} onPress={() => {this.startDispense();}}>
                  <Text style = {{color:'white'}}>
                    Dispense
                  </Text>
                    </TouchableHighlight> */
