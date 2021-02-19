import { StyleSheet } from "react-native";

let debug = false;
let host = debug ? "192.168.0.63" : "sigfox.merimp.com";
let port = debug ? "1880" : "1880";

export const WS_URL = `http://${host}:${port}/timbrature`;
export const WS_BADGE_CODE = `http://${host}:${port}/badge`;
export const WS_REQUEST_ASSOCIATION = `http://${host}:${port}/richiesta`;
export const WS_CHECK_ASSOCIATION_REQUESTED = `http://${host}:${port}/isRequested`;
export const WS_LAST_TIMBRATURE = `http://${host}:${port}/lastAccess`;


// true to enable debug alerts
export const DEBUG_ALERTS = false;

export const BADGE_IN = "in";
export const BADGE_OUT = "out";

export const DEFAULT_REGION = {
  identifier: "REGION1",
  uuid: null,
};
export const REGION0 = {
  identifier: "REGION1",
  uuid: "c7c1a1bf-bb00-4cad-8704-9f2d2917ded2",
};
export const REGION1 = {
  identifier: "REGION1",
  uuid: "c7c1a1bf-bb00-4cad-8704-9f2d2917ded2",
  major: 1,
  minor: 1,
};
export const REGION2 = {
  identifier: "REGION1",
  uuid: "c7c1a1bf-bb00-4cad-8704-9f2d2917ded2",
  major: 1,
  minor: 2,
};
export const DEFAULT_BEACON = {
  proximity: "immediate",
  major: 1,
  distance: 0.6216304791867999,
  rssi: -65,
  minor: 1,
  uuid: "c7c1a1bf-bb00-4cad-8704-9f2d2917ded2",
};

export const THEME = StyleSheet.create({
  header: {
    backgroundColor: "#1e3956",
  },
});

export const MERIMP_BLUE = "#1e3956";
export const CMAT_GRAY = "#d7d7d7";
export const CMAT_BLUE = "#0b0e2d";

export const CMAT_MAIL = "it@merimp.com";

export const STATUSBAR_COLOR = CMAT_GRAY;
export const HEADER_BACKGROUND = CMAT_GRAY;
export const HEADER_TITLE_COLOR = CMAT_BLUE;
export const HEADER_TITLE_TEXT = "MI TIMBRA";
