import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../common/Colors'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import HistoryPageComponent from './HistoryPageComponent'
import PersonalCopyShareModal from './PersonalCopyShareModal'
import moment from 'moment'
import _ from 'underscore'
import DeviceInfo from 'react-native-device-info'
import ErrorModalContents from '../../components/ErrorModalContents'
import SmallHeaderModal from '../../components/SmallHeaderModal'
import PersonalCopyHelpContents from '../../components/Helper/PersonalCopyHelpContents'
import HistoryHeaderComponent from './HistoryHeaderComponent'
import {
  getPDFData,
  confirmPDFShared,
  emptyShareTransferDetailsForContactChange,
  keeperProcessStatus,
  updatedKeeperInfo,
  updateMSharesHealth,
  createChannelAssets,
  setApprovalStatus,
} from '../../store/actions/health'
import KeeperTypeModalContents from './KeeperTypeModalContent'
import {
  ChannelAssets,
  KeeperInfoInterface,
  LevelHealthInterface,
  MetaShare,
  Trusted_Contacts,
} from '../../bitcoin/utilities/Interface'
import { StackActions } from 'react-navigation'
import QRModal from '../Accounts/QRModal'
import ApproveSetup from './ApproveSetup'
import KeeperProcessStatus from '../../common/data/enums/KeeperProcessStatus'
import { setIsPermissionGiven } from '../../store/actions/preferences'
import { v4 as uuid } from 'uuid'
import SSS from '../../bitcoin/utilities/sss/SSS'
import config from '../../bitcoin/HexaConfig'
import { initializeTrustedContact, InitTrustedContactFlowKind } from '../../store/actions/trustedContacts'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { getTime } from '../../common/CommonFunctions/timeFormatter'

const PersonalCopyHistory = ( props ) => {
  const dispatch = useDispatch()
  const [ ErrorBottomSheet, setErrorBottomSheet ] = useState( React.createRef() )
  const [ HelpBottomSheet, setHelpBottomSheet ] = useState( React.createRef() )
  const [ keeperTypeBottomSheet, setkeeperTypeBottomSheet ] = useState(
    React.createRef()
  )
  const storagePermissionBottomSheet = useRef<BottomSheet>()
  const [ hasStoragePermission, setHasStoragePermission ] = useState( false )

  const [ selectedKeeperType, setSelectedKeeperType ] = useState( '' )
  const [ selectedKeeperName, setSelectedKeeperName ] = useState( '' )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ errorMessageHeader, setErrorMessageHeader ] = useState( '' )
  const [ QrBottomSheet, setQrBottomSheet ] = useState( React.useRef() )
  const [ QrBottomSheetsFlag, setQrBottomSheetsFlag ] = useState( false )
  const [ blockReshare, setBlockReshare ] = useState( '' )
  const [ ApprovePrimaryKeeperBottomSheet, setApprovePrimaryKeeperBottomSheet ] = useState( React.createRef() )
  const [ personalCopyHistory, setPersonalCopyHistory ] = useState( [
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ] )
  const [
    PersonalCopyShareBottomSheet,
    setPersonalCopyShareBottomSheet,
  ] = useState( React.createRef() )
  const selectedPersonalCopy = props.navigation.getParam(
    'selectedPersonalCopy'
  )
  const [ personalCopyDetails, setPersonalCopyDetails ] = useState( null )
  const [ selectedLevelId, setSelectedLevelId ] = useState(
    props.navigation.state.params.selectedLevelId
  )
  const [ selectedKeeper, setSelectedKeeper ] = useState(
    props.navigation.state.params.selectedKeeper
  )
  const [ isReshare, setIsReshare ] = useState(
    props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true
  )
  const levelHealth = useSelector( ( state ) => state.health.levelHealth )
  const currentLevel = useSelector( ( state ) => state.health.currentLevel )
  const keeperInfo = useSelector( ( state ) => state.health.keeperInfo )
  const pdfInfo = useSelector( ( state ) => state.health.pdfInfo )
  const [ isChange, setIsChange ] = useState( props.navigation.getParam( 'isChangeKeeperType' )
    ? props.navigation.getParam( 'isChangeKeeperType' )
    : false )
  const pdfDataConfirm = useSelector( ( state ) => state.health.loading.pdfDataConfirm )
  const pdfCreatedSuccessfully = useSelector( ( state ) => state.health.pdfCreatedSuccessfully )
  const [ confirmDisable, setConfirmDisable ] = useState( true )
  const [ isChangeKeeperAllow, setIsChangeKeeperAllow ] = useState( props.navigation.getParam( 'isChangeKeeperAllow' ) )
  const MetaShares: MetaShare[] = useSelector(
    ( state ) => state.health.service.levelhealth.metaSharesKeeper,
  )
  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )
  const [ Contact, setContact ]:[any, any] = useState( {
  } )
  const index = 5
  const channelAssets: ChannelAssets = useSelector( ( state ) => state.health.channelAssets )
  const approvalStatus = useSelector( ( state ) => state.health.approvalStatus )

  useEffect( () => {
    setSelectedLevelId( props.navigation.getParam( 'selectedLevelId' ) )
    setSelectedKeeper( props.navigation.getParam( 'selectedKeeper' ) )
    setIsReshare(
      props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ? false : true
    )
    setIsChange(
      props.navigation.getParam( 'isChangeKeeperType' )
        ? props.navigation.getParam( 'isChangeKeeperType' )
        : false
    )
    if( !channelAssets.shareId || ( channelAssets.shareId && channelAssets.shareId != props.navigation.getParam( 'selectedKeeper' ).shareId ) ){
      dispatch( createChannelAssets( props.navigation.getParam( 'selectedKeeper' ).shareId ) )
    }
  }, [
    props.navigation.state.params
  ] )

  useEffect( ()=>{
    const Contact = selectedKeeper.data && selectedKeeper.data.id ? selectedKeeper.data : {
      id: uuid(),
      name: 'Personal Copy'
    }
    setContact( Contact )
  }, [ ] )

  useEffect( ()=>  {
    if( Platform.OS === 'ios' ) {
      ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
      setHasStoragePermission( true )
    } else {
      hasStoragePermission
        ? ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
        : ( storagePermissionBottomSheet as any ).current.snapTo( 1 )
    }
    if( hasStoragePermission ){
      generatePDF()
    }
  }, [ hasStoragePermission ] )
  // const saveInTransitHistory = async () => {
  //   try{
  //       const shareHistory = JSON.parse(await AsyncStorage.getItem("shareHistory"));
  //     if (shareHistory) {
  //       let updatedShareHistory = [...shareHistory];
  //       // updatedShareHistory = {
  //       //   ...updatedShareHistory,
  //       //   inTransit: Date.now(),
  //       // };
  //       updateHistory(updatedShareHistory);
  //       await AsyncStorage.setItem(
  //         "shareHistory",
  //         JSON.stringify(updatedShareHistory)
  //       );
  //     }
  //   }catch(e){
  //     console.log('e', e)
  //   }
  // };

  const generatePDF = async() => {
    createGuardian( Contact )
    const shareHistory = JSON.parse(
      await AsyncStorage.getItem( 'shareHistory' )
    )
    if ( shareHistory ) updateHistory( shareHistory )
  }

  const sortedHistory = ( history ) => {
    const currentHistory = history.filter( ( element ) => {
      if ( element.date ) return element
    } )

    const sortedHistory = _.sortBy( currentHistory, 'date' )
    sortedHistory.forEach( ( element ) => {
      element.date = moment( element.date )
        .utc()
        .local()
        .format( 'DD MMMM YYYY HH:mm' )
    } )

    return sortedHistory
  }

  const updateHistory = ( shareHistory ) => {
    const updatedPersonalCopyHistory = [ ...personalCopyHistory ]
    if ( shareHistory.createdAt )
      updatedPersonalCopyHistory[ 0 ].date = shareHistory.createdAt
    if ( shareHistory.inTransit )
      updatedPersonalCopyHistory[ 1 ].date = shareHistory.inTransit

    if ( shareHistory.accessible )
      updatedPersonalCopyHistory[ 2 ].date = shareHistory.accessible

    if ( shareHistory.notAccessible )
      updatedPersonalCopyHistory[ 3 ].date = shareHistory.notAccessible

    setPersonalCopyHistory( updatedPersonalCopyHistory )
  }

  useEffect( () => {
    if( pdfCreatedSuccessfully ){
      setConfirmDisable( false )
      if( props.navigation.getParam( 'selectedKeeper' ).status === 'notSetup' ) {
        ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
      }
    }
  }, [ pdfCreatedSuccessfully ] )

  useEffect( () => {
    if( pdfInfo.filePath ){
      setConfirmDisable( false )
    }
  }, [ pdfInfo ] )

  useEffect( () => {
    if( !pdfDataConfirm ){
      dispatch( keeperProcessStatus( KeeperProcessStatus.COMPLETED ) )
    }
  }, [ pdfDataConfirm ] )

  const renderErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          ( ErrorBottomSheet as any ).current.snapTo( 0 )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage, errorMessageHeader ] )

  const renderErrorModalHeader = useCallback( () => {
    return (
      <ModalHeader
      // onPressHeader={() => {
      //   (ErrorBottomSheet as any).current.snapTo(0);
      // }}
      />
    )
  }, [] )

  const renderPersonalCopyShareModalContent = useCallback( () => {
    return (
      <PersonalCopyShareModal
        removeHighlightingFromCard={() => {}}
        selectedPersonalCopy={selectedPersonalCopy}
        personalCopyDetails={personalCopyDetails}
        onPressBack={() => {
          ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressShare={() => {
          const shareObj = {
            walletId: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.walletId,
            shareId: selectedKeeper.shareId,
            reshareVersion: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.reshareVersion,
            shareType: 'pdf',
            status: 'notAccessible',
            name: 'Personal Copy'
          }
          dispatch( updateMSharesHealth( shareObj, false ) )
        }}
        onPressConfirm={() => {
          try {
            dispatch( keeperProcessStatus( KeeperProcessStatus.IN_PROGRESS ) );
            ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
            if (
              props.navigation.getParam( 'prevKeeperType' ) &&
              props.navigation.getParam( 'isChange' ) &&
              props.navigation.getParam( 'contactIndex' ) &&
              props.navigation.getParam( 'prevKeeperType' ) == 'contact' &&
              props.navigation.getParam( 'contactIndex' ) != null
            ) {
              dispatch(
                emptyShareTransferDetailsForContactChange(
                  props.navigation.getParam( 'contactIndex' )
                )
              )
            }
            setIsReshare( true )
          } catch ( err ) {
            dispatch( keeperProcessStatus( '' ) )
            console.log( 'error', err )
          }
        }}
      />
    )
  }, [ selectedPersonalCopy, personalCopyDetails ] )

  const renderPersonalCopyShareModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( PersonalCopyShareBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const renderHelpHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  const renderHelpContent = () => {
    return (
      <PersonalCopyHelpContents
        titleClicked={() => {
          if ( HelpBottomSheet.current )
            ( HelpBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  const getStoragePermission = async () => {
    // await checkStoragePermission()
    if ( Platform.OS === 'android' ) {
      const granted = await requestStoragePermission()
      if ( !granted ) {
        setErrorMessage(
          'Cannot access files and storage. Permission denied.\nYou can enable files and storage from the phone settings page \n\n Settings > Hexa > Storage',
        )
        setHasStoragePermission( false );
        ( storagePermissionBottomSheet as any ).current.snapTo( 0 );
        ( ErrorBottomSheet as any ).current.snapTo( 1 )
        return
      }
      else {
        ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
        setHasStoragePermission( true )
      }
    }

    if ( Platform.OS === 'ios' ) {
      setHasStoragePermission( true )
      return
    }
  }

  const requestStoragePermission = async () => {
    try {
      dispatch( setIsPermissionGiven( true ) )
      const result = await PermissionsAndroid.requestMultiple( [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ] )
      if(
        result[ 'android.permission.READ_EXTERNAL_STORAGE' ] === PermissionsAndroid.RESULTS.GRANTED
        &&
        result[ 'android.permission.WRITE_EXTERNAL_STORAGE' ] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true
      }
      else {
        return false
      }
    } catch ( err ) {
      console.warn( err )
      return false
    }
  }

  const checkStoragePermission = async () =>  {
    dispatch( setIsPermissionGiven( true ) )
    if( Platform.OS==='android' ) {
      const [ read, write ] = [
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE ),
        await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE )
      ]
      if( read && write ) {
        setHasStoragePermission( true )
        return true
      }
      else {
        setHasStoragePermission( false )
        return false
      }
    }

  }

  const renderStoragePermissionModalContent = useCallback( () => {
    checkStoragePermission()
    return (
      <ErrorModalContents
        modalRef={storagePermissionBottomSheet}
        title={'Why do we need access to your files and storage?'}
        info={'File and Storage access will let Hexa save a pdf with your Recovery Keys. This will also let Hexa attach the pdf to emails, messages and to print in case you want to.\n\n'}
        otherText={'Don’t worry these are only sent to the email address you choose, in the next steps you will be able to choose how the pdf is shared.'}
        proceedButtonText={'Continue'}
        isIgnoreButton={false}
        onPressProceed={() => {
          getStoragePermission()
        }}
        onPressIgnore={() => {
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
      />
    )
  }, [] )

  const createGuardian = useCallback(
    async ( Contact ) => {
      if( selectedKeeper.channelKey ) return
      const channelKey: string = !isChange && selectedKeeper.channelKey ? selectedKeeper.channelKey : SSS.generateKey( config.CIPHER_SPEC.keyLength )

      const obj: KeeperInfoInterface = {
        shareId: selectedKeeper.shareId,
        name: Contact && Contact.name ? Contact.name : '',
        type: 'pdf',
        scheme: MetaShares.find( value=>value.shareId==selectedKeeper.shareId ).meta.scheme,
        currentLevel: currentLevel,
        createdAt: moment( new Date() ).valueOf(),
        sharePosition: MetaShares.findIndex( value=>value.shareId==selectedKeeper.shareId ),
        data: {
          ...Contact, index: 5
        },
        channelKey
      }
      dispatch( updatedKeeperInfo( obj ) )
      dispatch( initializeTrustedContact( {
        contact: Contact,
        flowKind: InitTrustedContactFlowKind.SETUP_TRUSTED_CONTACT,
        isKeeper: true,
        channelKey,
        shareId: selectedKeeper.shareId
      } ) )
    },
    [ trustedContacts ],
  )

  useEffect( () => {
    if( !Contact ) return

    const contacts: Trusted_Contacts = trustedContacts.tc.trustedContacts
    let channelKey: string

    if( contacts )
      for( const ck of Object.keys( contacts ) ){
        if ( contacts[ ck ].contactDetails.id === Contact.id ){
          channelKey = ck
          break
        }
      }

    if ( channelKey ) {
      dispatch( getPDFData( selectedKeeper.shareId, Contact, channelKey, isChange ) )
      const appVersion = DeviceInfo.getVersion()
      console.log( 'setSecondaryQR Contact', Contact )
    }
  }, [ Contact, trustedContacts ] )

  const renderStoragePermissionModalHeader = useCallback( () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          ( storagePermissionBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }, [] )

  const onPressChangeKeeperType = ( type, name ) => {
    let levelhealth: LevelHealthInterface[] = []
    if ( levelHealth[ 1 ] && levelHealth[ 1 ].levelInfo.findIndex( ( v ) => v.updatedAt > 0 ) > -1 )
      levelhealth = [ levelHealth[ 1 ] ]
    if ( levelHealth[ 2 ] && levelHealth[ 2 ].levelInfo.findIndex( ( v ) => v.updatedAt > 0 ) > -1 )
      levelhealth = [ levelHealth[ 1 ], levelHealth[ 2 ] ]
    if ( currentLevel == 3 && levelHealth[ 2 ] )
      levelhealth = [ levelHealth[ 2 ] ]
    let changeIndex = 1
    let contactCount = 0
    let deviceCount = 0
    for ( let i = 0; i < levelhealth.length; i++ ) {
      const element = levelhealth[ i ]
      for ( let j = 2; j < element.levelInfo.length; j++ ) {
        const element2 = element.levelInfo[ j ]
        if (
          element2.shareType == 'contact' &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelhealth[ i ]
        ) {
          contactCount++
        }
        if (
          element2.shareType == 'device' &&
          selectedKeeper &&
          selectedKeeper.shareId != element2.shareId &&
          levelhealth[ i ]
        ) {
          deviceCount++
        }
        const kpInfoContactIndex = keeperInfo.findIndex( ( value ) => value.shareId == element2.shareId && value.type == 'contact' )
        if ( type == 'contact' && element2.shareType == 'contact' && contactCount < 2 ) {
          if ( kpInfoContactIndex > -1 && keeperInfo[ kpInfoContactIndex ].data.index == 1 ) {
            changeIndex = 2
          } else changeIndex = 1
        }
        if( type == 'device' ){
          if ( element2.shareType == 'device' && deviceCount == 1 ) {
            changeIndex = 3
          } else if( element2.shareType == 'device' && deviceCount == 2 ){
            changeIndex = 4
          }
        }
      }
    }
    if ( type == 'contact' ) {
      props.navigation.navigate( 'TrustedContactHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        index: changeIndex,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'device' ) {
      props.navigation.navigate( 'SecondaryDeviceHistoryNewBHR', {
        ...props.navigation.state.params,
        selectedTitle: name,
        index: changeIndex,
        isChangeKeeperType: true,
      } )
    }
    if ( type == 'pdf' ) {
      ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
    }
  }
  const sendApprovalRequestToPK = ( ) => {
    setQrBottomSheetsFlag( true );
    ( QrBottomSheet as any ).current.snapTo( 1 );
    ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
  }

  const renderQrContent = () => {
    return (
      <QRModal
        isFromKeeperDeviceHistory={false}
        QRModalHeader={'QR scanner'}
        title={'Note'}
        infoText={
          'Open your PDF copy and scan the first QR for approval.'
        }
        modalRef={QrBottomSheet}
        isOpenedFlag={QrBottomSheetsFlag}
        onQrScan={async( qrScannedData ) => {
          dispatch( confirmPDFShared( selectedKeeper.shareId, qrScannedData ) )
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
          const popAction = StackActions.pop( {
            n: isChange ? 2 : 1
          } )
          props.navigation.dispatch( popAction )
        }}
        onBackPress={() => {
          setQrBottomSheetsFlag( false )
          if ( QrBottomSheet ) ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onPressContinue={async() => {
          const qrScannedData = '{"type":"pdf","encryptedData":"35c329e9d0ffa374bf2a9589173578c0bdc8727c4e7a3cb5c6862854717a1c88657751643790a4c48308060e8d4adf47ec647b475cbdc2ced65b2b91c8a2beb1","encryptedKey":"814a3670890461aa790a66385bf3068bdf04f13d296b8a06d6716adf9622b0ac9cbe9b7593e7894efb77afd1a9280588f24a50d300d44e3d37c840a41947232c3b0272fe57465c96e1d09892591a7259"}'
          dispatch( confirmPDFShared( selectedKeeper.shareId, qrScannedData ) )
          setQrBottomSheetsFlag( false )
        }}
      />
    )
  }

  const renderQrHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  useEffect( ()=>{
    if( approvalStatus && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 1 );
      ( QrBottomSheet as any ).current.snapTo( 0 )
    }
  }, [ approvalStatus ] )

  useEffect( ()=>{
    if( isChange && channelAssets.shareId && channelAssets.shareId == selectedKeeper.shareId ){
      dispatch( setApprovalStatus( true ) )
    }
  }, [ channelAssets ] )

  const deviceText = ( text ) => {
    switch ( text ) {
        case 'Keeper PDF': return 'PDF Backup'

        default:
          return text
    }
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <HistoryHeaderComponent
        onPressBack={() => props.navigation.goBack()}
        selectedTitle={deviceText( props.navigation.state.params.selectedTitle )}
        selectedTime={selectedKeeper.updatedAt
          ? getTime( selectedKeeper.updatedAt )
          : 'never'}
        moreInfo={deviceText( props.navigation.state.params.selectedTitle )}
        headerImage={require( '../../assets/images/icons/note.png' )}
      />
      <View style={{
        flex: 1
      }}>
        <HistoryPageComponent
          type={'copy'}
          IsReshare={isReshare}
          data={sortedHistory( personalCopyHistory )}
          confirmDisable={confirmDisable}
          onConfirm={ isReshare && selectedKeeper.status == 'notAccessible' ? ()=>{
            ( QrBottomSheet as any ).current.snapTo( 1 )
          } : null}
          confirmButtonText={'Share Now'}
          onPressConfirm={() => {
            ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
          }}
          reshareButtonText={'Reshare'}
          onPressReshare={async () => {
            console.log(
              'onPressReshare PersonalCopyShareBottomSheet',
              PersonalCopyShareBottomSheet
            );
            ( PersonalCopyShareBottomSheet as any ).current.snapTo( 1 )
          }}
          isChangeKeeperAllow={isChangeKeeperAllow}
          changeButtonText={'Change'}
          onPressChange={() => {
            ( keeperTypeBottomSheet as any ).current.snapTo( 1 )
          }}
        />
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={PersonalCopyShareBottomSheet as any}
        snapPoints={[ -50, hp( '85%' ) ]}
        renderContent={renderPersonalCopyShareModalContent}
        renderHeader={renderPersonalCopyShareModalHeader}
      />
      <BottomSheet
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />

      <BottomSheet
        enabledInnerScrolling={true}
        ref={HelpBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '87%' ) : hp( '89%' ),
        ]}
        renderContent={renderHelpContent}
        renderHeader={renderHelpHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={keeperTypeBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '75%' ) : hp( '75%' ),
        ]}
        renderContent={() => (
          <KeeperTypeModalContents
            headerText={'Change backup method'}
            subHeader={'Share your Recovery Key with a new contact or a different device'}
            onPressSetup={async ( type, name ) => {
              setSelectedKeeperType( type )
              setSelectedKeeperName( name )
              sendApprovalRequestToPK( )
            }}
            onPressBack={() => ( keeperTypeBottomSheet as any ).current.snapTo( 0 )}
            selectedLevelId={selectedLevelId}
            keeper={selectedKeeper}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() =>
              ( keeperTypeBottomSheet as any ).current.snapTo( 0 )
            }
          />
        )}
      />
      <BottomSheet
        onOpenEnd={() => {
          setQrBottomSheetsFlag( true )
        }}
        onCloseEnd={() => {
          setQrBottomSheetsFlag( false );
          ( QrBottomSheet as any ).current.snapTo( 0 )
        }}
        onCloseStart={() => { }}
        enabledGestureInteraction={false}
        enabledInnerScrolling={true}
        ref={QrBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '92%' ) : hp( '91%' ),
        ]}
        renderContent={renderQrContent}
        renderHeader={renderQrHeader}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ApprovePrimaryKeeperBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '60%' ) : hp( '70' ),
        ]}
        renderContent={() => (
          <ApproveSetup
            isContinueDisabled={false}
            onPressContinue={() => {
              onPressChangeKeeperType( selectedKeeperType, selectedKeeperName );
              ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            onPressHeader={() => {
              ( keeperTypeBottomSheet as any ).current.snapTo( 1 );
              ( ApprovePrimaryKeeperBottomSheet as any ).current.snapTo( 0 )
            }}
          />
        )}
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={storagePermissionBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '55%' ) : hp( '60%' ),
        ]}
        renderContent={renderStoragePermissionModalContent}
        renderHeader={renderStoragePermissionModalHeader}
      />
    </View>
  )
}

export default PersonalCopyHistory

const styles = StyleSheet.create( {
} )
