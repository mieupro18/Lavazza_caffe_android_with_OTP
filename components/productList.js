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

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      productList: [
        'product1',
        'product2',
        'product3',
        'product4',
        'product5',
        'product6',
        'product7',
        'product8',
      ],
      productListURL: [
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

  render() {
    return (
      <ScrollView style={{flexGrow: 1}}>
        {this.state.productListURL.map((product, index) => {
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

        <Modal
          animationType="slide"
          // transparent={true}
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
                    this.state.productListURL[this.state.selectedIndex].src
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
                    this.state.productListURL[this.state.selectedIndex]
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
                      modalVisible: !this.state.modalVisible,
                    });
                  }}>
                  Cancel
                </Icon.Button>

                <Icon.Button
                  name="trash"
                  size={30}
                  color="white"
                  backgroundColor="#b85400">
                  Get My Drink
                </Icon.Button>
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
