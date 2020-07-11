/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Image, View, Text, Modal} from 'react-native';
import {Card, CardItem} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import BackgroundTimer from 'react-native-background-timer';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/Entypo';
import Fontawesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';

// ORDER POSITIVE STATUS CODE
const BEFORE_PLACING_ORDER = 0;
const ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE = 1;
const ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE = 2;
const PLACE_THE_CUP = 3;
const DISPENSING = 4;
const ORDER_DISPENSED = 5;

// ORDER ERROR STATUS CODE
const SOMETHING_WENT_WRONG = 6;
const TIMEOUT_EXPIRED = 7;
const ORDER_CANCELLED = 8;
const MACHINE_NOT_READY = 9;
const UNDER_MAINTAINENCE = 10;

const orderStatus = {
  0: ' Order your Beverage',
  1: 'Please wait !!!',
  2: 'Order received\nPlease wait !!!',
  3: '      Click dispense\nafter placing the cup',
  4: 'Dispensing!!!',
  5: 'Beverage dispensed!!!',
  6: 'Something went wrong\nPlease check the connection',
  7: 'Timeout Expired',
  8: 'Order cancelled',
  9: 'Machine not ready',
  10: 'Under maintainence',
};

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      modalVisible: false,
      feedbackVisible: false,
      orderNumberVisible: false,
      waitTimeVisible: false,
      orderStatusCode: null,
      starCount: 0,
      deviceProductList: [],
      orderId: null,
      orderNumber: null,
      waitTime: null,
      timer: 30,
      machineName: null,
      allProductListURL: [
        {
          productName: 'Cappuccino',
          src: require('../assets/cappuccino.jpg'),
        },
        {
          productName: 'Espresso',
          src: require('../assets/espresso.jpg'),
        },
        {
          productName: 'Milk',
          src: require('../assets/milk.jpg'),
        },
        {
          productName: 'South Indian Coffee Light',
          src: require('../assets/SIC_light.jpg'),
        },
        {
          productName: 'South Indian Coffee Strong',
          src: require('../assets/SIC_strong.jpg'),
        },
        {
          productName: 'Tea Milk',
          src: require('../assets/tea_milk.jpg'),
        },
        {
          productName: 'Tea Water',
          src: require('../assets/tea_water.jpg'),
        },
        {
          productName: 'Lemon Tea',
          src: require('../assets/lemon_tea.png'),
        },
      ],
    };
  }

  async componentDidMount() {
    this.showProductList(this.props.route.params.productList);
  }

  async componentWillUnmount() {}

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
    this.setState({machineName: this.props.route.params.machineName});
  };

  checkForFeedbackVisibility = async productName => {
    var feedbackTimeDetails = JSON.parse(
      await AsyncStorage.getItem(productName),
    );
    console.log(feedbackTimeDetails);
    const currentTime = Date.parse(new Date());
    console.log(currentTime);
    if (feedbackTimeDetails === null) {
      feedbackTimeDetails = {
        lastFeedbackDisplayedTime: currentTime,
        nextFeedbackInterval: 60000,
      };
      await AsyncStorage.setItem(
        productName,
        JSON.stringify(feedbackTimeDetails),
      );
      console.log(await AsyncStorage.getItem(productName));
      return false;
    }
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

  getTimeoutSignal = async () => {
    // eslint-disable-next-line no-undef
    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, 5000);
    return controller;
  };

  stopPollForOrderStatus = async () => {
    BackgroundTimer.clearInterval(this.pollingIntervalId);
  };

  startPollForOrderStatus = async productName => {
    this.pollingIntervalId = BackgroundTimer.setInterval(async () => {
      fetch(
        'http://192.168.5.1:9876/orderStatus?orderId=' + this.state.orderId,
        {
          headers: {
            tokenId: 'secret',
          },
          signal: (await this.getTimeoutSignal()).signal,
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
              this.setState({
                orderStatusCode: PLACE_THE_CUP,
                waitTimeVisible: false,
              });
              this.timer = BackgroundTimer.setInterval(async () => {
                this.setState({timer: this.state.timer - 1});
                console.log(this.state.timer);
                if (this.state.timer === 0) {
                  BackgroundTimer.clearInterval(this.timer);
                  this.setState({timer: 30});
                  this.setState({
                    orderStatusCode: TIMEOUT_EXPIRED,
                    orderId: null,
                    orderNumberVisible: false,
                    waitTimeVisible: false,
                    orderNumber: null,
                    waitTime: null,
                  });
                }
              }, 1000);
            } else if (resultData.orderStatus === 'Dispensing') {
              this.setState({waitTimeVisible: false});
              console.log('Dispensing');
              console.log('Continue poll');
            } else if (resultData.orderStatus === 'Dispensed') {
              console.log('Dispensed');
              this.stopPollForOrderStatus();
              if (await this.checkForFeedbackVisibility(productName)) {
                console.log('feedback visible');
                this.setState({
                  feedbackVisible: true,
                });
              }
              this.setState({
                orderStatusCode: ORDER_DISPENSED,
                orderId: null,
                orderNumberVisible: false,
              });
            } else if (resultData.orderStatus === 'Machine is not Ready') {
              console.log('not ready');
              this.stopPollForOrderStatus();
              this.setState({
                orderStatusCode: MACHINE_NOT_READY,
                orderId: null,
              });
            }
          } else {
            this.stopPollForOrderStatus();
            this.setState({
              orderStatusCode: SOMETHING_WENT_WRONG,
              orderId: null,
              orderNumberVisible: false,
              waitTimeVisible: false,
              orderNumber: null,
              waitTime: null,
            });
          }
          //console.log(this.state.orderStatusCode);
        })
        .catch(async e => {
          this.stopPollForOrderStatus();
          this.setState({
            orderStatusCode: SOMETHING_WENT_WRONG,
            orderId: null,
            orderNumberVisible: false,
            waitTimeVisible: false,
            orderNumber: null,
            waitTime: null,
          });
        });
    }, 5000);
  };

  placeOrder = async (productId, productName) => {
    this.setState({
      orderStatusCode: ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE,
    });
    console.log(productId);
    fetch('http://192.168.5.1:9876/order?productId=' + productId, {
      headers: {
        tokenId: 'secret',
      },
      signal: (await this.getTimeoutSignal()).signal,
    })
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          this.setState({
            orderStatusCode: ORDER_PLACED_AND_RECEIVED_BY_THE_MACHINE,
            orderNumberVisible: true,
            waitTimeVisible: true,
            orderNumber: resultData.orderNo,
            waitTime: resultData.approxWaitTime,
          });
          console.log(resultData);
          console.log('ack');
          this.state.orderId = resultData.orderId;
          console.log(this.state.orderNumber, this.state.waitTime);
          await this.startPollForOrderStatus(productName);
        } else {
          if (resultData.infoText === 'Machine is not Ready') {
            this.setState({orderStatusCode: MACHINE_NOT_READY});
          } else {
            this.setState({orderStatusCode: SOMETHING_WENT_WRONG});
          }
        }
      })
      .catch(async e => {
        console.log(e);
        this.setState({
          orderStatusCode: SOMETHING_WENT_WRONG,
          orderNumberVisible: false,
          waitTimeVisible: false,
          orderNumber: null,
          waitTime: null,
        });
      });
  };

  startDispense = async productName => {
    BackgroundTimer.clearInterval(this.timer);
    this.setState({timer: 30});
    this.setState({orderStatusCode: DISPENSING});
    fetch('http://192.168.5.1:9876/dispense?orderId=' + this.state.orderId, {
      headers: {
        tokenId: 'secret',
      },
      signal: (await this.getTimeoutSignal()).signal,
    })
      .then(response => response.json())
      .then(async resultData => {
        console.log(resultData);
        if (resultData.status === 'Success') {
          console.log('Dispense Starts');
          this.startPollForOrderStatus(productName);
        } else {
          if (resultData.infoText === 'Machine is not Ready ') {
            this.setState({orderStatusCode: MACHINE_NOT_READY, orderId: null});
          } else {
            this.setState({
              orderStatusCode: SOMETHING_WENT_WRONG,
              orderId: null,
              orderNumberVisible: false,
              waitTimeVisible: false,
              orderNumber: null,
              waitTime: null,
            });
          }
        }
      })
      .catch(async e => {
        this.setState({
          orderStatusCode: SOMETHING_WENT_WRONG,
          orderId: null,
          orderNumberVisible: false,
          waitTimeVisible: false,
          orderNumber: null,
          waitTime: null,
        });
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
      machineName: this.state.machineName,
    };
    AsyncStorage.setItem('feedbackData', JSON.stringify(feedbackData));
    console.log(await AsyncStorage.getItem('feedbackData'));
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            backgroundColor: '#100A45',
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            style={{width: '50%', height: '65%', resizeMode: 'contain'}}
            source={require('../assets/Lavazza-White-Logo-No-Background-.png')}
          />
        </View>
        <ScrollView>
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
                        style={{width: 75, height: 75, borderRadius: 20}}
                        source={product.src}
                      />
                    </View>
                    <View
                      style={{
                        justifyContent: 'center',
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
                            orderStatusCode: BEFORE_PLACING_ORDER,
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
                  this.state.orderStatusCode >=
                    ORDER_PLACED_AND_NOT_YET_RECEIVED_BY_THE_MACHINE &&
                  this.state.orderStatusCode <= DISPENSING
                ) {
                  console.log('Please dont go back');
                } else if (this.state.orderStatusCode === ORDER_DISPENSED) {
                  this.props.navigation.goBack();
                } else {
                  this.setState({modalVisible: false, feedbackVisible: false});
                }
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  {this.state.orderStatusCode === BEFORE_PLACING_ORDER ||
                  this.state.orderStatusCode >= SOMETHING_WENT_WRONG ? (
                    <Icon
                      name="circle-with-cross"
                      onPress={() => {
                        this.setState({
                          modalVisible: !this.state.modalVisible,
                        });
                      }}
                      size={30}
                      style={{color: '#100A45', left: '95%'}}
                    />
                  ) : null}

                  <View style={{marginTop: 10, alignItems: 'center'}}>
                    <Image
                      style={{width: 100, height: 25}}
                      source={require('../assets/lavazza_logo_without_year.png')}
                    />
                  </View>
                  <View
                    style={{
                      marginTop: 10,
                      marginBottom: 'auto',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.productName}>
                      {
                        this.state.deviceProductList[this.state.selectedIndex]
                          .productName
                      }
                    </Text>
                  </View>
                  <View style={{marginTop: 10, alignItems: 'center'}}>
                    <Image
                      style={{width: 75, height: 75, borderRadius: 150 / 2}}
                      source={
                        this.state.deviceProductList[this.state.selectedIndex]
                          .src
                      }
                    />
                  </View>
                  {this.state.orderNumberVisible ? (
                    <View
                      style={{
                        marginTop: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight:'bold',
                          color: '#100A45',
                        }}>
                        Order No {this.state.orderNumber}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      marginTop: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: '#6F6D6D', fontSize: 10}}>Status</Text>
                    <Text
                      style={{marginTop: 5, color: '#100A45', fontSize: 13}}>
                      {orderStatus[this.state.orderStatusCode]}
                    </Text>
                  </View>

                  {this.state.waitTimeVisible ? (
                    <View
                      style={{
                        marginTop: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: '',
                          color: '#100A45',
                        }}>
                        Approx Wait Time: {this.state.waitTime}min
                      </Text>
                    </View>
                  ) : null}

                  {/* visible when feedback time arrives  */}
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
                  {this.state.orderStatusCode === ORDER_DISPENSED ? (
                    <View
                      style={{
                        alignItems: 'center',
                        marginTop: 20,
                      }}>
                      <MaterialCommunityIcons.Button
                        name="check-circle"
                        size={30}
                        color="white"
                        backgroundColor="#100A45"
                        onPress={async () => {
                          this.props.navigation.goBack();
                        }}>
                        Done
                      </MaterialCommunityIcons.Button>
                    </View>
                  ) : null}

                  {this.state.orderStatusCode === PLACE_THE_CUP ? (
                    <View style={{}}>
                      <View
                        style={{
                          marginTop: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Fontawesome5.Button
                          name="mug-hot"
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
                        </Fontawesome5.Button>
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

                  {this.state.orderStatusCode === BEFORE_PLACING_ORDER ||
                  this.state.orderStatusCode >= SOMETHING_WENT_WRONG ? (
                    <View
                      style={{
                        alignItems: 'center',
                        marginTop: 20,
                      }}>
                      <MaterialCommunityIcons.Button
                        name="hand-pointing-up"
                        size={30}
                        color="white"
                        backgroundColor="#100A45"
                        onPress={async () => {
                          await this.placeOrder(
                            this.state.deviceProductList[
                              this.state.selectedIndex
                            ].productId,
                            this.state.deviceProductList[
                              this.state.selectedIndex
                            ].productName,
                          );
                        }}>
                        Order
                      </MaterialCommunityIcons.Button>
                    </View>
                  ) : null}
                </View>
              </View>
            </Modal>
          ) : null}
        </ScrollView>
      </View>
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
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: '#100A45',
    borderWidth: 1.5,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 35,
    paddingTop: 10,
    //alignItems: 'center',
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
                  source={require('../assets/Cupshot3.jpg')}
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
                    this.state.orderStatusCode === ORDER_REQUEST_FAILED ||
                thi
                this.state.orderStatusCode === ORDER_CANCELLED_BY_SERVER ||
                this.state.orderStatusCode === TIMEOUT_EXPIRED ? (
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
                    ) : null

     ORDER ERROR STATUS
/*const ORDER_REQUEST_FAILED = 'Order request failed\nTry again or restart..!!!';
const DISPENSE_REQUEST_FAILED =
  'Dispense request failed\nTimeout expired\nTry again or restart..!!!';
const TIMEOUT_EXPIRED = 'Timeout expired\nTry again or restart..!!!';
const ORDER_STATUS_REQUEST_FAILED =
  'Getting order status failed\nTry again or restart..!!!';
const ORDER_CANCELLED_BY_SERVER = 'Order cancelled\nTry again..!!!';*/
/*{(! this.state.isConnected) && (! this.state.splashScreenVisible) ?*/

/*<Image
                  style={{width:'100%',height:}}
                  source={require('../assets/Cupshot3.jpg')}
                  /> : null
                  productId={
                          this.state.deviceProductList[this.state.selectedIndex]
                            .productId
                        }

                        <Modal animationType='slide' visible={this.state.orderStatus===DISPENSING} onRequestClose={()=>{console.log('do nothing');}}>

            <Image style ={{flex:1,alignSelf:'stretch',width:null,height:null}} source={require('../assets/Cupshot3.jpg')}/>

                    </Modal>
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
