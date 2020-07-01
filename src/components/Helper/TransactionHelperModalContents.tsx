import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function TransactionHelperModalContents(props) {

    const openLink = (url) => {
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.log("Don't know how to open URI: " + url);
          }
        })
    }

  return (
    <ScrollView
        style={styles.modalContainer}
        snapToInterval={hp('89%')}
        decelerationRate='fast'
    >
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingBottom: hp('4%')}}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    style={{
                        color: Colors.white,
                        fontFamily: Fonts.FiraSansMedium,
                        fontSize: RFValue(20),
                        marginTop: hp('1%'),
                        marginBottom: hp('1%'),
                    }}
                >
                    Transaction
                </Text>
            </View>
            <View
                style={{
                backgroundColor: Colors.homepageButtonColor,
                height: 1,
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                marginTop: 10,
                marginBottom: hp('1%'),
                }}
            />
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
            A transction is identified by an alphanumeric{'\n'}string called the transaction ID, which acts as a{'\n'}permanent reference to your payment on the{'\n'}Bitcoin blockchain
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/bitcoin_transaction_id.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                You can independently verify your transaction{'\n'}by looking up the transaction ID on a block{'\n'}explorer like blockstream.info
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                source={require('../../assets/images/icons/rabbit.png')}
                style={{ width: wp('25%'), height: wp('25%'), resizeMode: 'contain' }}
                />
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View
                    style={{
                        borderStyle: 'dotted',
                        borderWidth: 1,
                        borderRadius: 1,
                        borderColor: Colors.white,
                        width: wp('70%'),
                        height: 0,
                    }}
                />
            </View>
        </View>
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('4%')}}>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
            A transaction requires some time to confirm,{'\n'}and this delay is called the confirmation time.{'\n'}The confirmation time depends on the fees{'\n'}paid by the transaction, and on the structure{'\n'}of the transaction.
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/confirmation_time.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                For most transactions, six confirmations is taken{'\n'}as reference.You can see the number of {'\n'}confirmations against the transaction within Hexa
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/rabbit.png')}
                    style={{ width: wp('25%'), height: wp('25%'), resizeMode: 'contain' }}
                />
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View
                    style={{
                        borderStyle: 'dotted',
                        borderWidth: 1,
                        borderRadius: 1,
                        borderColor: Colors.white,
                        width: wp('70%'),
                        height: 0,
                    }}
                />
            </View>
        </View>
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('6%')}}>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                How quickly the miners pick up your{'\n'}transaction from the mempool depends on the{'\n'}fee associated with it
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/transaction_confirmation.png')}
                    style={{ width: wp('90%'), height: wp('90%'), resizeMode: 'contain' }}
                />
            </View>
            <View style={{flexDirection: 'row', marginLeft: wp('10%'), marginRight: wp('10%'), justifyContent: 'center', flexWrap: 'wrap'}}>
                <Text
                    style={{
                        color: Colors.white,
                        // textAlign: 'center',
                        fontSize: RFValue(12),
                        fontFamily: Fonts.FiraSansRegular,
                    }}
                >
                    To know more,
                </Text>
                <TouchableOpacity style={{marginLeft: 5}} onPress={() => openLink("https://www.blockchain.com/charts/mempool-size")}> 
                    <Text
                        style={{
                            color: Colors.white,
                            fontSize: RFValue(12),
                            fontFamily: Fonts.FiraSansRegular,
                            textDecorationLine: 'underline',
                            textAlign: 'center',
                        }}
                    >
                        click here
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/rabbit.png')}
                    style={{ width: wp('25%'), height: wp('25%'), resizeMode: 'contain' }}
                />
            </View>
        </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: hp('5%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});