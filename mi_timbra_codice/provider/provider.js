import React from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUniqueId } from "react-native-device-info";
import { BluetoothStatus } from "react-native-bluetooth-status";

const DEFAULT_USER = {
  name: null,
  surname: null,
  company: null,
};

export const StateContext = React.createContext({
  user: DEFAULT_USER,
});

export default class Provider extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      lastCostCode: null,
      deviceId: getUniqueId(),
      badgeCode: null,
      isBluetoothEnabled: false,
      isAssociationRequested: false,
      user: DEFAULT_USER,
      showLaunchPage: true,
    };

    if (Platform.OS === "android") BluetoothStatus.enable(true);
    this._getBluetoothState();
  }

  writeLastCostCode = async () => {
    AsyncStorage.setItem("lastCostCode", this.state.lastCostCode);
  };
  _setShowLaunchPage = async (status) => {
    console.log("Provider._setShowLaunchPage", status);
  };

  writeShowLaunchPage = async () => {
      let res = false;
      await AsyncStorage.setItem("showLaunchPage", res);
  };
  writeShowLaunchPage2 = async (show) => {
    await AsyncStorage.setItem("showLaunchPage", show);
  };
  writeIsAssociationRequested = async () => {
      let state = this.state.isAssociationRequested;
      AsyncStorage.setItem(
        "isAssociationRequested",
        JSON.stringify(state)
      );
  };

  _setUser = (user) => {
    this.setState({ user });
  };
  _resetUser = () => {
    this.setState({
      user: DEFAULT_USER,
      badgeCode: null,
      lastCostCode: null,
    });
  };
  _setLastCostCode = async (lastCostCode) => {
    await this.setState({ lastCostCode });
    this.writeLastCostCode();
  };
  _setBadgeCode = (badgeCode) => {
    this.setState({ badgeCode });
  };
  _setIsAssociationRequested = (_bool) => {
    this.setState({ isAssociationRequested: _bool });
  };
  _getBluetoothState = async () => {
    const isBluetoothEnabled = await BluetoothStatus.state();
    this.setState({ isBluetoothEnabled });
  };

  componentDidMount() {
    this._getBluetoothState();
    BluetoothStatus.addListener((isEnabled) => {
      this.setState({ isBluetoothEnabled: isEnabled });
    });
  }
  componentDidUpdate() {
    console.log("Provider:status changed, im writing.");
    this.writeShowLaunchPage();
    this.writeIsAssociationRequested();
  }
  componentWillUnmount() {
    BluetoothStatus.removeListener();
  }
  render() {
    return (
      <StateContext.Provider
        value={{
          ...this.state,
          _setUser: this._setUser,
          _resetUser: this._resetUser,
          _setLastCostCode: this._setLastCostCode,
          _setBadgeCode: this._setBadgeCode,
          _setIsAssociationRequested: this._setIsAssociationRequested,
          _setShowLaunchPage: this._setShowLaunchPage,
          writeShowLaunchPage2:this.writeShowLaunchPage2
        }}
      >
        {this.props.children}
      </StateContext.Provider>
    );
  }
}
