import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  RefreshControl,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/FontAwesome";

import { StateContext } from "../provider/provider";
import { WS_LAST_TIMBRATURE } from "../utils/config";

export default function InfoPage({ navigation }) {
  const state = useContext(StateContext);
  const [name, setName] = useState(null);
  const [surname, setSurname] = useState(null);
  const [company, setCompany] = useState(null);
  const [badgeCode, setBadgeCode] = useState(null);
  const [timbrature, setTimbrature] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setName(state.user.name);
    setSurname(state.user.surname);
    setBadgeCode(state.badgeCode);
    setCompany(state.user.company);
  }, [state]);

  useEffect(() => {
    // let timbr = [
    //   {
    //     message: "14-12-2020 09:13 in Entrata",
    //   },
    //   {
    //     message: "11-12-2020 18:10 in Uscita",
    //   },
    // ];
    // setTimbrature(timbr);
    fetchLastTimbrature();
    return () => {
      setTimbrature([]);
    };
  }, []);

  const fetchLastTimbrature = () => {
    setRefreshing(true);
    let body = { badgeCode: state.badgeCode };
    let ret = fetch(WS_LAST_TIMBRATURE, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    })
      .then((resp) => {
        setRefreshing(false);

        switch (resp.status) {
          case 200:
            return resp.json();
          default:
            return [];
        }
      })
      .then((data) => {
        setTimbrature(data);
        return data;
      })
      .catch((e) => {
        console.log("info.fetchLastTimbrature error", e);
        setRefreshing(false);
      });
    return ret;
  };

  const renderTimbratura = ({ item }) => {
    return <Text style={styles.text}>{item.message}</Text>;
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchLastTimbrature();
    //setRefreshing(false);
    //wait(2000).then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Impostazioni</Text>
      <View style={styles.cardContainer}>
        <Text style={styles.cardText}>Nome</Text>
        <TextInput
          style={styles.cardInput}
          onChangeText={setName}
          value={name}
          editable={false}
        />
      </View>
      <View style={styles.cardContainer}>
        <Text style={styles.cardText}>Cognome</Text>
        <TextInput
          style={styles.cardInput}
          onChangeText={setSurname}
          value={surname}
          editable={false}
        />
      </View>
      <View style={styles.cardContainer}>
        <Text style={styles.cardText}>Azienda</Text>
        <TextInput
          style={styles.cardInput}
          onChangeText={setCompany}
          value={company}
          editable={false}
        />
      </View>
      <View style={styles.cardContainer}>
        <Text style={styles.cardText}>Cod. Anagrafica</Text>
        <TextInput
          style={styles.cardInput}
          keyboardType="number-pad"
          onChangeText={setBadgeCode}
          maxLength={6}
          value={badgeCode}
          editable={false}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <Text style={styles.subtitle}>Ultime Timbrature</Text>
        <TouchableOpacity onPress={() => fetchLastTimbrature()}>
          <Icon
            style={{
              alignSelf: "center",
              padding: 10,
              marginLeft: 15,
            }}
            name="refresh"
            color="black"
            size={20}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        style={{}}
        renderItem={renderTimbratura}
        keyExtractor={(item, key) => "key" + key}
        data={timbrature}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            margin: 20,
          }}>
          <Button
            color="deepskyblue"
            title="Salva"
            onPress={async () => {
              await updateUser();
              //savePermanentUser();
            }}
          />
        </View>
        <View
          style={{
            margin: 20,
          }}>
          <Button
            color="tomato"
            title="Reset"
            onPress={async () => {
              await resetUser();
            }}
          />
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    padding: 10,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  title: {
    fontWeight: "bold",
    fontSize: 25,
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
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
  },
});
