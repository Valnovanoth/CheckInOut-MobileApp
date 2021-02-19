import React, { useEffect, useState, useContext } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Geolocation from "@react-native-community/geolocation";

import Beacons from "react-native-beacons-manager";

import { createOpenLink, createMapLink } from "react-native-open-maps";

import Icon from "react-native-vector-icons/FontAwesome";

import {
  WS_URL,
  BADGE_IN,
  BADGE_OUT,
  DEBUG_ALERTS,
} from "../utils/config";

import { StateContext } from "../provider/provider";
import { truncateString } from "../utils/utils";

export const REGION_IOS = {
  identifier: "REGION1",
  uuid: "c7c1a1bf-bb00-4cad-8704-9f2d2917ded2",
};

// const REGION = REGION0;
const REGION = REGION_IOS;

let _didRange = null;
let _regionEnter = null;
let _regionExit = null;

export default function HomePageIos({ navigation }) {
  const state = useContext(StateContext);
  const [name, setName] = useState(null);
  const [surname, setSurname] = useState(null);
  const [badgeCode, setBadgeCode] = useState(null);
  const [costCode, setCostCode] = useState(null);
  const [deviceId, setDeviceId] = useState(state.deviceId);
  const [isInRegion, setIsInRegion] = useState(false);
  const [lastBestBeacon, setLastBestBeacon] = useState(null);
  const [alertEnabled, setAlertEnabled] = useState(DEBUG_ALERTS);
  const [location, setLocation] = useState(null);
  const [isPositionRequesting, setIsPositionRequesting] = useState(false);
  const [isBadging, setIsBadging] = useState(false);

  useEffect(() => {
    setName(state.user.name);
    setSurname(state.user.surname);
    setDeviceId(state.deviceId);
    setBadgeCode(state.badgeCode);
    setCostCode(state.lastCostCode);
  }, [state]);

  useEffect(() => {
    console.log("is position requesting:", isPositionRequesting);
  }, [isPositionRequesting]);

  useEffect(() => {
    authStateDidRangeEvent = Beacons.BeaconsEventEmitter.addListener(
      "authorizationStatusDidChange",
      (info) => console.log("authorizationStatusDidChange: ", info)
    );
    Beacons.requestAlwaysAuthorization();

    Beacons.startMonitoringForRegion(REGION) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
      .then(() => console.log("Beacons monitoring started succesfully."))
      .catch((error) =>
        console.log(`Beacons monitoring not started, error: ${error}`)
      );
    // Monitoring: Listen for device entering the defined region
    regionDidEnterEvent = Beacons.BeaconsEventEmitter.addListener(
      "regionDidEnter",
      (data) => {
        console.log("monitoring - regionDidEnter data: ", data);
        setIsInRegion(true);
      }
    );
    // Monitoring: Listen for device leaving the defined region
    regionDidExitEvent = Beacons.BeaconsEventEmitter.addListener(
      "regionDidExit",
      (region) => {
        console.log("monitoring - regionDidExit", region);
        setLastBestBeacon(null);
        setIsInRegion(false);
      }
    );

    // Range for beacons inside the region
    Beacons.startRangingBeaconsInRegion(REGION) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
      .then(() => console.log("Beacons ranging started succesfully."))
      .catch((error) =>
        console.log(`Beacons ranging not started, error: ${error}`)
      );
    Beacons.shouldDropEmptyRanges(false);

    beaconsDidRangeEvent = Beacons.BeaconsEventEmitter.addListener(
      "beaconsDidRange",
      (data) => {
        //console.log('beaconsDidRange data: ', data);
        /*         
          data.beacons.map((item) => {
            item.distance = 0;
            item.rssi = 0;
            console.log(item);
          });
        */
        if (data.beacons.length > 0) {
          setIsInRegion(true);
        }
        if (data.beacons.length == 0) {
          setIsInRegion(false);
        }
        let b = data.beacons.reduce(
          (ret, item, id, beacons) => {
            if (item.distance < ret.min) {
              return { min: item.distance, beacon: item };
            }
            return ret;
          },
          { min: 100, beacon: null }
        );
        if (b.beacon != null) setLastBestBeacon(b.beacon);
      }
    );

    Beacons.startUpdatingLocation();

    return () => {
      Beacons.stopMonitoringForRegion(REGION)
        .then(() => {
          setIsInRegion(false);
          console.log("Beacons monitoring stopped succesfully");
        })
        .catch((error) =>
          console.warn(`Beacons monitoring not stopped, error: ${error}`)
        );
      // stop ranging beacons:
      Beacons.stopRangingBeaconsInRegion(REGION)
        .then(() => {
          setLastBestBeacon(null);
          console.log("Beacons ranging stopped succesfully");
        })
        .catch((error) =>
          console.warn(`Beacons ranging not stopped, error: ${error}`)
        );
      // stop updating locationManager:
      Beacons.stopUpdatingLocation();

      authStateDidRangeEvent.remove();
      // remove monitoring events we registered at componentDidMount
      regionDidEnterEvent.remove();
      regionDidExitEvent.remove();
      // remove ranging event we registered at componentDidMount
      //beaconsDidRangeEvent.remove();
    };
  }, []);
  /*   useEffect(() => {
    console.log('CIAO');
    requestLocationPermission();
    detectBeacons();
    registerMonitoringListener();
    registerRangingListener();
    return () => {
      unregisterMonitorListener();
      unregisterRangingListener();
    };
  }, []);

  useEffect(() => {
    startMonitoring(REGION);
    startRanging(REGION);
    return () => {
      stopMonitoring(REGION);
      stopRanging(REGION);
    };
  }, []); */

  const checkPosition = () => {
    let pos = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    let url = createMapLink(pos);
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert("Errore", "Non è possibile aprire le mappe.");
    });
  };
  const doBadge = (type) => {
    Keyboard.dismiss();
    if (!costCode) {
      Alert.alert("Attenzione", "Inserire Centro di Costo valido.");
      return;
    }
    // performing state change only if costCode changes
    if (costCode != state.lastCostCode) state._setLastCostCode(costCode);

    if (!badgeCode) {
      Alert.alert(
        "Attenzione",
        "Codice badge non riconosciuto, contattare amministrazione"
      );
    }

    if (lastBestBeacon == null && location == null) {
      Alert.alert("Attenzione", "Impossibile completare la timbratura.", [
        { text: "Riprova", style: "destructive" },
      ]);
      return;
    }

    let body = {
      name,
      surname,
      badgeCode,
      costCode,
      deviceId,
      type,
    };

    if (lastBestBeacon) {
      body.beacon = lastBestBeacon;
    }
    if (location) {
      body.position = location.coords;
    }

    //_isRequesting = true;
    setIsBadging(true);

    fetch(WS_URL, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    })
      .then((resp) => {
        let status = resp.status;
        //_isRequesting = false;
        setIsBadging(false);
        switch (status) {
          case 200:
            Alert.alert("Confermato", "Timbratura effettuata.");
            setLastBestBeacon(null);
            setLocation(null);
            break;
          default:
            Alert.alert("Errore", "La timbratura non è andata a buon fine.", [
              {
                text: "Riprova",
                style: "cancel",
              },
            ]);
            break;
        }
      })
      .catch((e) => {
        //_isRequesting = false;
        setIsBadging(false);
        Alert.alert("Errore", "Errore imprevisto durante la timbratura.");
      });
  };
  const findCoordinates = () => {
    setIsPositionRequesting(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setIsPositionRequesting(false);
        setLocation(position);
      },
      (e) => {
        setIsPositionRequesting(false);
        Alert.alert("", e.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };
  const requestingSpinner = () => (
    <View
      style={{
        margin: 20,
        paddingVertical: 70,
      }}
    >
      <ActivityIndicator size="large" color="tomato" />
    </View>
  );
  const renderSuggestions = () => (
    <View style={{ paddingVertical: 20 }}>
      {state.isBluetoothEnabled ? (
        <Text style={{ fontSize: 18 }}>
          <Icon name="bluetooth" color="dodgerblue" size={22} /> Avvicinati al
          punto di badge.
        </Text>
      ) : (
        <Text style={{ fontSize: 18 }}>
          <Icon name="bluetooth" color="gray" size={22} /> Attiva il bluetooth.
        </Text>
      )}

      <Text
        style={{
          padding: 15,
          alignSelf: "center",
        }}
      >
        oppure
      </Text>
      <Text style={{ fontSize: 18 }}>
        <Icon name="map-marker" color="tomato" size={24} /> Utilizza la
        posizione GPS.
      </Text>
    </View>
  );
  const badgingSection = () => {
    return (
      <ScrollView keyboardShouldPersistTaps="handled">
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{}}>
              Ciao{" "}
              <Text style={styles.subtitle}>
                {truncateString(`${name} ${surname}`, 18)}
              </Text>
            </Text>
            <Button
              title="Info"
              color=""
              onPress={() => {
                navigation.navigate("Info");
              }}
            />
          </View>
        </View>
        <View style={styles.cardContainer}>
          <Text style={styles.cardText}>Centro di costo</Text>
          <TextInput
            style={styles.cardInput}
            keyboardType="number-pad"
            maxLength={5}
            onChangeText={setCostCode}
            value={costCode}
          />
        </View>
        <View>
          {isBadging ? (
            requestingSpinner()
          ) : (
            <View>
              {isInRegion ? null : (
                <View>
                  {renderSuggestions()}
                  {isPositionRequesting ? (
                    <View style={{}}>
                      <ActivityIndicator size="large" color="tomato" />
                    </View>
                  ) : (
                    <Button
                      title="Cattura Posizione GPS"
                      onPress={() => {
                        Keyboard.dismiss();
                        findCoordinates();
                      }}
                    />
                  )}

                  {/* // DEBUG POSIZIONE */}
                  {false ? <Text>{JSON.stringify(location)}</Text> : null}
                  {location ? (
                    <View>
                      <Text>
                        <Text style={styles.boltText}>Latitudine</Text>:{" "}
                        {location.coords.latitude.toFixed(2)}{" "}
                        <Text style={styles.boltText}>Longitudine</Text>:{" "}
                        {location.coords.longitude.toFixed(2)}
                      </Text>
                      <Text>
                        <Text style={styles.boltText}>Precisione </Text>:{" "}
                        {location.coords.accuracy.toFixed(0)} metri.
                      </Text>
                      <Button
                        title="Controlla Posizione Rilevata"
                        onPress={() => {
                          checkPosition();
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              )}
              <View>
                <View
                  style={{
                    marginTop: 70,
                    marginVertical: 20,
                  }}
                >
                  <Button
                    color="limegreen"
                    disabled={isInRegion || location ? false : true}
                    title="Timbra Ingresso"
                    onPress={() => doBadge(BADGE_IN)}
                  />
                </View>
                <View
                  style={{
                    marginVertical: 20,
                  }}
                >
                  <Button
                    color="tomato"
                    disabled={isInRegion || location ? false : true}
                    title="Timbra Uscita"
                    onPress={() => doBadge(BADGE_OUT)}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };
  const debugButtons = () => {
    return (
      <>
        <Button
          title="MONITORING-ON"
          onPress={() => {
            startMonitoring(REGION);
          }}
        />
        <Button
          title="MONITORING-OFF"
          onPress={() => {
            stopMonitoring(REGION);
          }}
        />
        <Button
          title="RANGING-ON"
          onPress={() => {
            startRanging(REGION);
          }}
        />
        <Button
          title="RANGING-OFF"
          onPress={() => {
            stopRanging(REGION);
          }}
        />
      </>
    );
  };
  const wait = (timeout) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "padding" : null}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          backgroundColor: "white",
          flex: 1,
        }}
      >
        <View
          style={{
            padding: 20,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {state.badgeCode ? badgingSection() : null}

          {alertEnabled ? debugButtons() : null}
          <View style={{ flex: 1 }} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    padding: 10,
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "pink",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  boltText: {
    fontWeight: "bold",
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
  buttonView: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: "deepskyblue",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
  },
});

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Permesso Localizzazione",
        message:
          "MI Timbra necessita del permesso di accedere alla posizione per riuscire ad utilizzare il bluetooth del disposivo.",
        buttonNeutral: "Chiedi dopo",
        buttonNegative: "Rifiuta",
        buttonPositive: "OK",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      // permission denied
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};
