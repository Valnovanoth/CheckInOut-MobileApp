import React, { useEffect, useState, useContext } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { StateContext } from "../provider/provider";

import Icon from "react-native-vector-icons/FontAwesome";

import {
  WS_BADGE_CODE,
  WS_REQUEST_ASSOCIATION,
  WS_CHECK_ASSOCIATION_REQUESTED,
} from "../utils/config";

let _isRequesting = false;

export default function AssociationPage({ navigation }) {
  const state = useContext(StateContext);
  const [name, setName] = useState(null);
  const [surname, setSurname] = useState(null);
  const [badgeCode, setBadgeCode] = useState(null);
  const [deviceId, setDeviceId] = useState(state.deviceId);
  const [isCheckingBadgeCode, setIsCheckingBadgeCode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAssociationRequested, setIsAssociationRequested] = useState(false);
  const [associationRequest, setAssociationRequest] = useState(null);

  useEffect(() => {
    setName(state.user.name);
    setSurname(state.user.surname);
    setDeviceId(state.deviceId);
    setBadgeCode(state.badgeCode);
  }, [state]);

  useEffect(() => {
    //getBadgeCode().then((code) => state._setBadgeCode(code));
    getBadgeCode();
    checkIsAssociationRequested();
  }, []);

  const requestAssociation = () => {
    if (!name) return Alert.alert("", "Inserire il nome.");
    if (!surname) return Alert.alert("", "Inserire il cognome.");
    if (!deviceId) return Alert.alert("", "Errore su DeviceCode.");
    let body = {
      name,
      surname,
      deviceId,
    };
    let ret = fetch(WS_REQUEST_ASSOCIATION, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    })
      .then((resp) => {
        switch (resp.status) {
          case 200:
            setIsAssociationRequested(true);
            return resp.json();
            break;
          default:
            Alert.alert("Errore", "Errore di sistema, riprova più tardi.");
            break;
        }
      })
      .then((data) => {
        if (data.requestId) {
          setAssociationRequest({ id: data.requestId });
          Alert.alert(
            "Associazione",
            "Richiesta eseguita con id: " + data.requestId
          );
        }
        if (data.requestId == 0)
          Alert.alert("Associazione", "Richiesta in lavorazione.");
      })
      .catch((e) => {
        console.log("reqeustAssociation", e);
        Alert.alert("Errore", "Errore richiesta associazione.");
        setRefreshing(false);
        setIsCheckingBadgeCode(false);
        setIsAssociationRequested(false);
      });
    return ret;
  };
  const checkIsAssociationRequested = () => {
    if (!deviceId) return Alert.alert("", "Errore su DeviceCode.");
    let body = {
      deviceId,
    };
    let ret = fetch(WS_CHECK_ASSOCIATION_REQUESTED, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    })
      .then((resp) => {
        switch (resp.status) {
          case 200:
            setIsAssociationRequested(true);
            return resp.json();
          case 404:
            setIsAssociationRequested(false);
            return;
          default:
            Alert.alert("Errore", "Errore di sistema, riprova più tardi.");
            break;
        }
      })
      .then((data) => {
        if (data) {
          setAssociationRequest(data);
        }
        return;
      })
      .catch((e) => {
        setRefreshing(false);
        setIsCheckingBadgeCode(false);
        setIsAssociationRequested(false);
        setAssociationRequest(null);
      });
    return ret;
  };

  const getBadgeCode = () => {
    setRefreshing(true);
    setIsCheckingBadgeCode(true);
    let body = {
      deviceId: deviceId,
    };
    let ret = fetch(WS_BADGE_CODE, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    })
      .then((resp) => {
        setRefreshing(false);
        setIsCheckingBadgeCode(false);
        switch (resp.status) {
          case 401:
            //Alert.alert('Errore', 'Il tuo cellulare non è registrato!');
            break;
          case 200:
            // Alert.alert('Conferma', 'BadgeCode found.');
            return resp.json();
            break;
          default:
            Alert.alert("Errore", "Errore di sistema, riprova più tardi.");
            break;
        }
      })
      .then((data) => {
        if (!data) return null;
        if (data.badgeCode) state._setBadgeCode(data.badgeCode);
        if (data.nome && data.cognome)
          state._setUser({
            name: data.nome,
            surname: data.cognome,
            company: data.azienda,
          });
        return data.badgeCode;
      })
      .catch((e) => {
        console.log("getBadgeCode", e);
        Alert.alert("Errore", "Errore autenticazione utenza.");
        setRefreshing(false);
        setIsCheckingBadgeCode(false);
      });
    return ret;
  };

  const requestingSpinner = () => {
    return (
      <View
        style={{
          margin: 20,
          paddingVertical: 70,
        }}
      >
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  };
  const wait = (timeout) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getBadgeCode().then(() => {
      checkIsAssociationRequested()
        .then(() => {
          setRefreshing(false);
        })
        .catch(() => {
          setRefreshing(false);
        });
      //setRefreshing(false);
      //wait(2000).then(() => setRefreshing(false));
    });
  }, []);

  const goToLauchPage = () => {
    state._setShowLaunchPage(true);
    navigation.navigate('Launch')
  };

  if (isAssociationRequested) {
    return (
      <SafeAreaView style={{ backgroundColor: "white", flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View>
            <Icon
              style={{
                alignSelf: "center",
                padding: 15,
              }}
              name="exclamation-triangle"
              color="tomato"
              size={60}
            />
            <Text style={{ fontSize: 18, paddingBottom: 20 }}>
              Il tuo dispositivo non è associato ad alcuna anagrafica.
            </Text>
            <Text style={{ fontSize: 18, paddingBottom: 20, color: "black" }}>
              <Icon name="refresh" color="black" size={18} /> La tua richiesta è
              in fase di lavorazione
              {associationRequest
                ? ` con codice ${associationRequest.id}`
                : null}
              .
            </Text>

            <View
              style={{
                marginVertical: 20,
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  color: "gray",
                  paddingBottom: 3,
                }}
              >
                scorri verso il basso per aggiornare
              </Text>
              <Button
                color="gold"
                disabled={_isRequesting}
                title="Riprova"
                onPress={() => {
                  getBadgeCode();
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={{ backgroundColor: "white", flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Icon
              style={{
                alignSelf: "center",
                padding: 15,
              }}
              name="exclamation-triangle"
              color="tomato"
              size={60}
            />
            <Text style={{ fontSize: 18, paddingBottom: 20 }}>
              Il tuo dispositivo non è associato ad alcuna anagrafica.
            </Text>
            <Text style={{ fontSize: 16, paddingBottom: 15, color: "#5f5f5f" }}>
              Richiedi l'associazione compilando il form.
            </Text>
            <View style={styles.cardContainer}>
              <Text style={styles.cardText}>Nome</Text>
              <TextInput
                style={styles.cardInput}
                onChangeText={setName}
                value={name}
                textContentType="name"
              />
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.cardText}>Cognome</Text>
              <TextInput
                style={styles.cardInput}
                onChangeText={setSurname}
                value={surname}
                textContentType="familyName"
                onSubmitEditing={() => requestAssociation()}
              />
            </View>

            <View
              style={{
                margin: 20,
              }}
            >
              <Button
                color="deepskyblue"
                disabled={_isRequesting}
                title="Richiedi"
                onPress={() => {
                  requestAssociation();
                }}
              />
            </View>
            <View
              style={{
                margin: 20,
              }}
            >
              <Button
                color="deepskyblue"
                disabled={_isRequesting}
                title="Indietro"
                onPress={() => {
                  goToLauchPage();
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 5,
    padding: 10,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    flexGrow: 1,
  },
  cardInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "lightgray",
    minHeight: 40,
  },
});
