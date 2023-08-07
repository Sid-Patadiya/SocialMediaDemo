import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ContentView from '../../components/ContentView';
import {search_white_icon, message, expert_icon} from '../../constants/assets';
import {moderateScale} from '../../helpers/ResponsiveFonts';
import colors from '../../constants/colors';
import styles from './styles';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import auth from '@react-native-firebase/auth';
import Loader from '../../helpers/loader';
import firestore from '@react-native-firebase/firestore';
import ButtonComponent from '../../components/Button';
import ErrorComponent from '../../components/Error';
import CheckBox from '@react-native-community/checkbox';

export default function DeshbordScreen({navigation}) {
  const [data, setData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loader, setLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const [userdata, setUserData] = useState({});

  const [error, setError] = useState({
    groupName: false,
  });

  const logout = () => {
    auth().signOut();
  };

  useEffect(() => {
    getUsers();
    AllGroupData();
    setLoader(true);

    (async () => {
      const user = auth().onAuthStateChanged(userExist => {
        console.log('userExist~~', userExist);
        if (userExist) {
          setUserData(userExist);
        } else {
          setUserData('');
        }
      });
    })();
  }, []);

  const getUsers = async () => {
    const querySnap = await firestore()
      .collection('users')
      // .where('uid', '!=', userdata.uid)
      .get();

    const allUsers = querySnap.docs.map(docSnap => docSnap.data());
    // console.log('allUsers!!!', allUsers);
    setLoader(false);

    setData(allUsers);
  };

  const AllGroupData = async () => {
    const querySnap = await firestore()
      .collection('userGroup')
      .orderBy('createdAt', 'desc')
      .get();
    const allGroup = querySnap.docs.map(docSnap => docSnap.data());
    console.log('AllGroupData!!!', allGroup);
    setLoader(false);

    setGroupData(allGroup);
  };

  const createGroup = () => {
    const filterdata = data.filter(item => item.check == true);
    console.log('filterdata', filterdata);
    setLoader(true);
    try {
      firestore().collection('userGroup').doc(groupName).set({
        name: groupName,
        user: filterdata,
        createdAt: firestore.FieldValue.serverTimestamp(),
        // email: email,
        // uid: result.user.uid,
      });
      setShowModal(false);
      setGroupName('');
      AllGroupData();
      Alert.alert('Create Group SuccessFully');

      data.map(item => {
        item.check = false;
      });
      setData([...data]);
    } catch (error) {
      console.log(error);
      Alert.alert('Something Went Wrong');
    }
  };

  const checkGroup = text => {
    setGroupName(text);
    // groupData.filter(mapitem => {
    //   if (mapitem.name === text) {
    //     const editErrorState = {...error};

    //     console.log('mapitem.name', mapitem.name);
    //     setGroupName(text);
    //     editErrorState.groupName = true;
    //   } else {
    //     const editErrorState = {...error};

    //     console.log('mapitem', mapitem);
    //     editErrorState.groupName = false;
    //     setError(editErrorState);
    //     setGroupName(text);
    //   }
    // });
    // const filterData = groupData.filter(mapitem => {
    //   if (mapitem.name === text) {
    //     return mapitem.name;
    //   }
    // });
  };

  const onselect = (item, index) => {
    var tempCompare = data;

    if (tempCompare[index].check === true) {
      tempCompare[index].check = false;
    } else {
      tempCompare[index].check = true;
    }
    console.log('tempCompare', tempCompare);
    const filterdata = tempCompare.filter(item => item.check == true);

    if (filterdata.length !== 0) {
      setToggleCheckBox(true);
    } else {
      setToggleCheckBox(false);
    }
    setData([...tempCompare]);
  };

  const renderItem = ({item}) => {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate('ItemDetialsScreen', {data: item});
        }}
        style={styles.flatlistcontainer}>
        <View style={styles.mainContainer}>
          <View style={styles.userDetailsContainer}>
            <View style={{marginHorizontal: moderateScale(10)}}>
              <Image
                source={expert_icon}
                resizeMode="contain"
                style={{
                  height: moderateScale(30),
                  width: moderateScale(30),
                  borderRadius: 10,
                }}
              />
            </View>
            <View
              style={{
                marginHorizontal: moderateScale(15),
                width: '80%',
              }}>
              <Text style={styles.title}>{item.name}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ContentView
        visible={'true'}
        headerText={'Home'}
        rightIcon={require('../../assets/exit.png')}
        iconVisible={true}
        onRightIconPress={() => logout()}>
        <View style={styles.contentView}>
          <View
            style={{
              paddingBottom: moderateScale(10),
              marginHorizontal: moderateScale(20),
            }}>
            <TextInputWithLabel
              icon={search_white_icon}
              iconPress={true}
              inputPlaceholder={'Search'}
              inputValue={search}
              onTextInputChange={text => {
                setSearch(text);
              }}
              inputMaxLength={60}
              keyboardType="email-address"
            />
          </View>

          <FlatList
            data={groupData.filter(item =>
              item.name.toLowerCase().includes(search.trim().toLowerCase()),
            )}
            contentContainerStyle={{
              paddingBottom: moderateScale(20),
              marginHorizontal: moderateScale(20),
            }}
            ListEmptyComponent={<ListEmptyComponent />}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />

          <Pressable
            onPress={() => {
              // Alert.alert('Under Development');
              setShowModal(true);
            }}
            style={styles.AddButton}>
            <Image
              source={require('../../assets/add.png')}
              style={{
                height: moderateScale(30),
                width: moderateScale(30),
                tintColor: colors.White,
              }}
            />
          </Pressable>
        </View>
        <Loader value={loader} />

        <Modal
          visible={showModal}
          transparent
          onRequestClose={() => setShowModal(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}>
            <View
              style={{
                backgroundColor: colors.White,
                padding: moderateScale(10),
                marginHorizontal: moderateScale(20),
                elevation: 2,
                borderRadius: 10,
                shadowOffset: {height: 0, width: 0},
                shadowOpacity: 0.5,
                shadowRadius: 5,
                shadowColor: colors.Black,
              }}>
              <Text
                style={{
                  color: colors.Gray,
                  fontSize: moderateScale(20),
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                Create New Group
              </Text>
              <TextInputWithLabel
                icon={message}
                iconPress={true}
                inputPlaceholder={'Please enter group name'}
                inputValue={groupName}
                label={'Group Name'}
                onTextInputChange={text => checkGroup(text)}
                inputMaxLength={50}
                keyboardType={'deafult'}
              />
              {error.groupName && (
                <ErrorComponent
                  right={'left'}
                  errorMessage={'Group Name Already Exist'}
                />
              )}
              <View
                style={{
                  height: Dimensions.get('window').height / 5,
                  // backgroundColor: 'red',
                  marginVertical: moderateScale(20),
                }}>
                <FlatList
                  data={data}
                  nestedScrollEnabled
                  contentContainerStyle={{}}
                  renderItem={({item, index}) => {
                    console.log(item);
                    return (
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <CheckBox
                          disabled={false}
                          value={item.check}
                          style={{marginRight: 10, height: 20, width: 20}}
                          boxType="square"
                          tintColors={{true: colors.Blue, false: colors.Blue}}
                          tintColor={colors.Blue}
                          onTintColor={colors.Blue}
                          // onFillColor={colors.Blue}
                          onCheckColor={colors.Blue}
                          onValueChange={() => onselect(item, index)}
                        />
                        <View
                          // onPress={() => onselect(item)}
                          style={{
                            marginHorizontal: moderateScale(10),
                            marginVertical: moderateScale(10),
                          }}>
                          <Text style={{}}>{item.name}</Text>
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
              <View style={styles.buttonView}>
                <ButtonComponent
                  onButtonPress={() => createGroup()}
                  buttonText={'Create'}
                  buttonDisable={
                    groupName !== '' && toggleCheckBox == true ? false : true
                  }
                />
              </View>

              <Pressable
                onPress={() => {
                  setShowModal(false);
                }}
                style={{
                  position: 'absolute',
                  right: 0,
                  padding: moderateScale(10),
                }}>
                <Image
                  source={require('../../assets/add.png')}
                  style={{
                    height: moderateScale(30),
                    width: moderateScale(30),
                    transform: [{rotate: '45deg'}],
                  }}
                />
              </Pressable>
            </View>
          </View>
        </Modal>
      </ContentView>
    </View>
  );
}

const ListEmptyComponent = () => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}>
      <Text>No data found</Text>
    </View>
  );
};
