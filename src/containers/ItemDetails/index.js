import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import ContentView from '../../components/ContentView';
import {Back} from '../../constants/assets';
import styles from './styles';
import {GiftedChat} from 'react-native-gifted-chat';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ItemDetialsScreen = ({navigation, route}) => {
  const [data, setData] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sendMessage, setSendMessage] = useState('');
  const [userdata, setUserData] = useState({});

  useEffect(() => {
    if (route.params) {
      setData(route.params.data);
    }
    (async () => {
      const user = auth().onAuthStateChanged(userExist => {
        console.log(userExist);
        if (userExist) {
          setUserData(userExist);
        } else {
          setUserData('');
        }
      });
    })();

    const messageRef = firestore()
      .collection('ScocialChat')
      .doc(route.params.data.name)
      .collection('groupChat')
      .orderBy('createdAt', 'desc');

    messageRef.onSnapshot(async querySnap => {
      const allmsg = querySnap.docs.map(docSnap => {
        const data = docSnap.data();
        console.log('data@@@@@', data);
        if (data.createdAt) {
          return {
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt.toDate(),
          };
        } else {
          return {
            ...docSnap.data(),
            createdAt: new Date(),
          };
        }
      });
      setMessages(allmsg);
    });
  }, [route.params]);

  const onSend = messages => {
    const msg = messages[0];
    console.log('messages£££££', messages);
    const mymsg = {
      ...msg,
      sentBy: userdata.uid,
      sentTo: data.user,
      createdAt: new Date(),
    };
    console.log('mymsg', mymsg);
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );
    setSendMessage('');
    firestore()
      .collection('ScocialChat')
      .doc(data.name)
      .collection('groupChat')
      .add({...mymsg, createdAt: firestore.FieldValue.serverTimestamp()});
  };

  return (
    <View style={styles.container}>
      <ContentView
        visible={'true'}
        iconVisible={true}
        leftIcon={Back}
        headerText={data.name}
        onLeftIconPress={() => navigation.goBack()}>
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: userdata.uid,
            // avatar: 'https://placeimg.com/140/140/any',
            name: userdata.email,
          }}
        />
      </ContentView>
    </View>
  );
};

export default ItemDetialsScreen;
