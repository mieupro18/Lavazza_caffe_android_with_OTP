/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
  View,
  TouchableHighlight,
  ListView,
  SafeAreaView,
  Alert,
  Modal,
  BackHandler,
  PermissionsAndroid,
  ActivityIndicator,
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
} from 'native-base';

import Icon from 'react-native-vector-icons/Entypo';
import wifi from 'react-native-android-wifi';

// var productList = [
//   {productId: 101, productName: 'South Indian Coffee Strong'},
//   {productId: 102, productName: 'Tea Milk'},
//   {productId: 103, productName: 'Tea Water'},
// ];

const ipaddress = 'http://192.168.5.1:9876/';
class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ssid: 'Rascal',
      password: 'subash11',
      selectedIndex: 0,
      wifiConnectionStatus: false,
      deviceProductList: [],
      isDispensing: false,
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

      modalVisible: false,
    };
  }

  async componentDidMount() {
    console.log(wifi);
    await this.setState({isLoading: true});
    await this.askForUserPermissions();
    await wifi.setEnabled(true);

    await wifi.connectionStatus(async isConnected => {
      await this.setState({wifiConnectionStatus: isConnected});
    });

    if (this.state.wifiConnectionStatus) {
      await wifi.disconnect();
    }
    await wifi.findAndConnect(this.state.ssid, this.state.password, found => {
      console.log(found);
      this.setState({ssidExist: found});
    });

    await wifi.connectionStatus(async isConnected => {
      await this.setState({wifiConnectionStatus: isConnected});
    });

    await this.getProductInfo();
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
        console.log(
          'You will not able to retrieve wifi available networks list',
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  getProductInfo = async () => {
    fetch(ipaddress + 'getProductInfo')
      .then(response => response.json())
      .then(async resultData => {
        if (resultData.status === 'success') {
          let deviceProductList = [];

          await resultData.data.map(async product => {
            let filterProduct = await this.state.allProductListURL.find(
              allproduct => allproduct.productName === product.productName,
            );
            filterProduct.productId = product.productId;
            deviceProductList.push(filterProduct);
          });
          await this.setState({
            deviceProductList: deviceProductList,
            isLoading: false,
          });
        } else {
          await this.setState({isLoading: false});
        }
      })
      .catch(async e => {
        Alert.alert('Error', "Coundn't Connect to device", [
          {text: 'Close App', onPress: () => BackHandler.exitApp()},
        ]);
        console.log(e);
      });
  };
  async componentWillUnmount() {
    await wifi.setEnabled(false);
  }

  getDispense = async productId => {
    await this.setState({isDispensing: true});
    console.log(productId);

    fetch(ipaddress + 'dispenseProduct', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        productId: productId,
        customerName: 'Arun',
      },
    })
      .then(response => response.json())
      .then(async resultData => {
        if (resultData.status === 'success') {
          await this.setState({isDispensing: false});
          Alert.alert('Success', 'Get Your Drink', [{text: 'Thanks'}]);
        }
      })
      .catch(async e => {
        alert('Unable to Dispense. Please Try Again..!');
        await this.setState({isDispensing: false});
      });
  };

  render() {
    return (
      <ScrollView style={{flexGrow: 1}}>
        {this.state.deviceProductList.map((product, index) => {
          return (
            <TouchableHighlight
              onPress={async () => {
                await this.setState({
                  selectedIndex: index,
                });
                await this.setState({modalVisible: !this.state.modalVisible});
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
              await this.setState({modalVisible: false});
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

                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 20,
                  }}>
                  <Icon.Button
                    name="cross"
                    size={30}
                    color="black"
                    backgroundColor="#f1f2f6"
                    onPress={async () => {
                      await this.setState({
                        modalVisible: false,
                      });
                    }}>
                    Cancel
                  </Icon.Button>

                  <Icon.Button
                    disabled={this.state.isDispensing}
                    name="trash"
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
                    Get My Drink
                  </Icon.Button>
                </View>
                {this.state.isDispensing ? (
                  <View style={{flexDirection: 'row', marginTop: 20}}>
                    <ActivityIndicator size="small" color="#b85400" />
                    <Text style={styles.productName}>Dispensing...!</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Modal>
        ) : null}

        <Modal animationType="slide" visible={this.state.isLoading}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View>
                <Image
                  style={{width: 300, height: 300}}
                  source={require('../productImages/dispensing1.gif')}
                />
              </View>
              <View style={{flexDirection: 'row'}}>
                <ActivityIndicator size="small" color="#b85400" />
                <Text style={styles.productName}>Connecting...!</Text>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 22,
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
