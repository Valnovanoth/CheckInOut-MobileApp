import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  Keyboard,
  FlatList,
  Linking,
} from "react-native";

import { StateContext } from "../provider/provider";
import { CMAT_BLUE, CMAT_MAIL } from "../utils/config";

export default function LaunchPage({ navigation }) {
  const state = useContext(StateContext);

  const emailUs = () => {
    let url = `mailto:${CMAT_MAIL}?subject=Contatto%20App&body=Gentile%20Amministrazione\n`;
    if (Linking.canOpenURL(url)) Linking.openURL(url);
    else
      Alert.alert(
        "Errore",
        "Non è stato possibile aprire il tuo programma di email. Puoi trovare info sul nostro sito web."
      );
  };

  const goToAssociation = () => {
    navigation.navigate("Association");
    // Alert.alert(
    //   "Ricorda?",
    //   `Vuoi andare automaticamente alla prossima pagina la prossima volta?`,
    //   [
    //     {
    //       text: "Ricorda scelta",
    //       onPress: () => {
    //         state.writeShowLaunchPage2(false);
    //         navigation.navigate("Association");
    //       },
    //     },
    //     {
    //       text: "No",
    //       onPress: () => {
    //         navigation.navigate("Association");
    //       },
    //     },
    //   ]
    // );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: CMAT_BLUE }]}>
        Consorzio Mediterraneo per l’Alta Tecnologia
      </Text>
      <Text style={styles.subtitle}>
        Promuove e coordina le imprese aderenti, occupandosi del reperimento di
        materiali e opere e provvedendo a integrare e gestire efficacemente,
        nell’ambito di un’organizzazione sinergica, le varie attività avviate
        dalle società consorziate.
      </Text>
      <View style={styles.buttonHorizontal}>
        <View style={styles.button}>
          <Button title="Contattaci" onPress={emailUs} />
        </View>
        <View style={styles.button}>
          <Button title="Sono un dipendente CMAT" onPress={goToAssociation} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  title: {
    fontWeight: "bold",
    textAlign: "justify",
    fontSize: 25,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "justify",
    lineHeight: 28,
  },
  buttonHorizontal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    margin: 10,
  },
  text: {
    fontSize: 16,
  },
});
