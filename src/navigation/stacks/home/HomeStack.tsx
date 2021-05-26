import React from 'react'
import { createStackNavigator, StackViewTransitionConfigs } from 'react-navigation-stack'
import HomeScreen from '../../../pages/Home/Home'
import FriendsAndFamilyScreen from '../../../pages/FriendsAndFamily/FriendsAndFamilyScreen'
import HomeQRScannerScreen from '../../../pages/Home/HomeQRScannerScreen'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import MoreOptionsStack from '../more-options/MoreOptionsStack'
import AllTransactionsStack from '../transactions/AllTransactionsStack'
import defaultStackScreenNavigationOptions from '../../options/DefaultStackScreenNavigationOptions'
import AddNewAccountStack from '../accounts/AddNewAccountStack'
import NewWyreAccountDetailsScreen from '../../../pages/Accounts/AddNew/WyreAccount/NewWyreAccountDetailsScreen'
import WyreOrderFormScreen from '../../../pages/WyreIntegration/WyreOrderFormScreen'
import NewRampAccountDetailsScreen from '../../../pages/Accounts/AddNew/RampAccount/NewRampAccountDetailsScreen'
import RampOrderFormScreen from '../../../pages/RampIntegration/RampOrderFormScreen'
import QRStack from '../home/QRStack'
import Home from '../../../pages/Home/Home'
import TabNavigator from '../../TabNavigator'
import AccountDetailsStack from '../accounts/AccountDetailsStack'
import Header from '../Header'

const MODAL_ROUTES = [
  'AllTransactions',
  'QRScanner',
  'FriendsAndFamily',
  'MoreOptions',
  'PlaceWyreOrder',
  'PlaceRampOrder'
]


const HomeStack = createStackNavigator(
  {
    HomeRoot: {
      screen: Home,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    AddNewAccount: {
      screen: AddNewAccountStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    AccountDetails: {
      screen: AccountDetailsStack,
      navigationOptions: {
        header: null,
        // tabBarVisibl
      },
    },
    NewWyreAccountDetails: {
      screen: NewWyreAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Wyre Account'
      }
    },
    NewRampAccountDetails: {
      screen: NewRampAccountDetailsScreen,
      navigationOptions: {
        title: 'Setup Ramp Account'
      }
    },
    PlaceWyreOrder: {
      screen: WyreOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Wyre'
      }
    },
    PlaceRampOrder: {
      screen: RampOrderFormScreen,
      navigationOptions: {
        title: 'Buy with Ramp'
      }
    },
    AllTransactions: {
      screen: AllTransactionsStack,
      navigationOptions: {
        header: null,
      },
    },
    // FriendsAndFamily: FriendsAndFamilyScreen,
    QRScanner: {
      screen: QRStack,
      navigationOptions: {
        header: null,
      },
    },
    MoreOptions: {
      screen: MoreOptionsStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'HomeRoot',

    navigationOptions: ( { navigation } ) => {
      let tabBarVisible = false
      console.log( 'navigation.state.index>>>>>>>>', navigation.state.index )

      if ( navigation.state.index === 0 ) {
        tabBarVisible = true
      }

      return {
        tabBarVisible,
      }
    //   return {
    //     ...defaultStackScreenNavigationOptions,
    //     headerLeft: () => {
    //       return <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} />
    //     },
    //   }
    },
    transitionConfig: ( transitionProps, prevTransitionProps ) => {
      const previousRouteName = prevTransitionProps?.scene.route.routeName
      const newRouteName = transitionProps.scene.route.routeName

      // 📝 Override the default presentation mode for screens that we
      // want to present modally
      const isModal = MODAL_ROUTES.some(
        ( screenName ) => [ previousRouteName, newRouteName ].includes( screenName )
      )

      return StackViewTransitionConfigs.defaultTransitionConfig(
        transitionProps,
        prevTransitionProps,
        isModal,
      )
    },
  },
)

// HomeStack.navigationOptions = ( { navigation } ) => {
//   let tabBarVisible = true
//   console.log( 'navigation.state.index', navigation.state.index )

//   if ( navigation.state.index > 0 ) {
//     tabBarVisible = false
//   }

//   return {
//     tabBarVisible,
//   }
// }

export default HomeStack
