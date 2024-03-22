import * as React from "react";
import Svg, { Path } from "react-native-svg";
const MenuIcon = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={50} height={50} {...props}>
    <Path d="M0 9v2h50V9Zm0 15v2h50v-2Zm0 15v2h50v-2Z" />
  </Svg>
);
export default MenuIcon;
