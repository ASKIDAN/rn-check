import React, {useEffect, useState} from 'react';
import ReactNativeBiometrics, {BiometryType} from 'react-native-biometrics'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text, TextInput,
  View,
} from 'react-native';

import {
  Colors
} from 'react-native/Libraries/NewAppScreen';

const rnBiometrics = new ReactNativeBiometrics()

const backgroundStyle = {
  backgroundColor: Colors.lighter,
};

const API_URL = 'http://192.168.31.11:3000';
const client = axios.create({ baseURL: API_URL });

function App(): JSX.Element {
  const [biometryType, setBiometryType] = useState<BiometryType>();
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userKey, setUserKey] = useState<string | null>(null);

  useEffect(() => {
    rnBiometrics.isSensorAvailable()
      .then(data => setBiometryType(data.biometryType))
  }, [])
  console.log('biometryType: ', biometryType);

  const onLogin = () => {
    rnBiometrics
      .biometricKeysExist()
      .then(async data => {
        const id = await AsyncStorage.getItem('userId');
        if (data.keysExist && id) {
          return rnBiometrics
            .createSignature({ promptMessage: 'Sign In', payload: id || '' })
            .then(res => {
              const { success, signature } = res

              if (success) {
                return client.post('/auth', { signature, id })
              }
              throw new Error('Cannot create signature');
            });
        }
        return rnBiometrics
          .createKeys()
          .then(res => {
            return client
              .post('/auth', { id: userId, key: userKey, publicKey: res.publicKey })
          });
      })
      .then(data => {
        if (data.data?.status) {
          setConfirmed(true);
          return AsyncStorage.setItem('userId', data.data.id)
        }
        else {
          setConfirmed(false)
        }
      })
      .catch(err => console.log(err))
  };

  const onClearKeys = () => rnBiometrics.deleteKeys();

  return (
    <SafeAreaView style={backgroundStyle}>
      <View>
        {!confirmed
          ?
            <View>
              <Text>Login</Text>
              <TextInput placeholder="user id" style={styles.input} onChangeText={setUserId}/>
              <TextInput placeholder="user key" style={styles.input} onChangeText={setUserKey}/>
              <Button title="LogIn" onPress={onLogin}/>
            </View>
          : <Text>You are welcome!</Text>}
        <Button title="Clear FID keys" onPress={onClearKeys}/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: '25%',
    backgroundColor: 'yellow',
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1
  },

});

export default App;
