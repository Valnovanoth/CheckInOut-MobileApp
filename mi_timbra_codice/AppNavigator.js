import React, { useContext } from "react";
import { View, Image, Platform } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import AssociationPage from "./pages/association";
import HomePageAndroid from "./pages/home_android";
import HomePageIos from "./pages/home_ios";
import InfoPage from "./pages/info";
import LaunchPage from "./pages/launch";

import { StateContext } from "./provider/provider";

import {
  HEADER_BACKGROUND,
  HEADER_TITLE_COLOR,
  HEADER_TITLE_TEXT,
} from "./utils/config";

const Stack = createStackNavigator();

const MyNavigator = () => {
  const state = useContext(StateContext);
  const renderLogo = () => (
    <View>
      <Image
        style={{
          height: 40,
          resizeMode: "contain",
        }}
        source={require("./assets/cmat_logo_t.png")}
      />
    </View>
  );
  const launchPageRoute = () => {
    if (state.showLaunchPage) {
      return (
        <>
          <Stack.Screen name="Launch" component={LaunchPage} />
        </>
      );
    }
  };
  const initialRouteName = () => {
    return state.showLaunchPage ? 'Launch' : 'Association'
  };
  const routes = () => {
    switch (Platform.OS) {
      case "ios":
        return <Stack.Screen name="Home" component={HomePageIos} />;
      case "android":
        return (
          <>
            <Stack.Screen name="Home" component={HomePageAndroid} />
            <Stack.Screen name="Info" component={InfoPage} />
          </>
        );
      default:
        break;
    }
  };
  console.log('FIRST PAGE',initialRouteName())
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName()}
        screenOptions={{
          headerStyle: { backgroundColor: HEADER_BACKGROUND },
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 16,
            color: HEADER_TITLE_COLOR,
            fontWeight: "bold",
          },
          headerLeft: () => renderLogo(),
          title: HEADER_TITLE_TEXT,
          gestureEnabled: true,
        }}
      >
        {state.badgeCode ? (
          routes()
        ) : (
          <>
            {/* {launchPageRoute()} */}
            <Stack.Screen name="Association" component={AssociationPage} />
            <Stack.Screen name="Launch" component={LaunchPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MyNavigator;
