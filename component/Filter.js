import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { positionFilterState } from "../atom/Players";
import { useRecoilState } from "recoil";
const Filter = (props) => {
  const { players } = props;
  const positions = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF"];
  const [positionFilter, setPostionFilter] =
    useRecoilState(positionFilterState);
  const onFilterPress = (position) => {
    setPostionFilter((curPostionFilter) => {
      if (curPostionFilter.includes(position)) {
        return curPostionFilter.filter((position1) => position1 !== position);
      } else {
        return [...curPostionFilter, position];
      }
    });
  };
  const isSelected = (position) => {
    return positionFilter.includes(position);
  };
  return (
    <View style={styles.container}>
      {positions.map((position, index) => {
        if (index === 0) return;
        else {
          return (
            <Pressable
              style={{
                ...styles.filterContainer,
                backgroundColor: isSelected(position) ? "blue" : "green",
              }}
              onPress={() => onFilterPress(position)}
              key={index}
            >
              <Text style={styles.text}>{position}</Text>
            </Pressable>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddding: 10,
    justifyContent: "flex-start",
  },
  filterContainer: {
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  text: {
    fontWeight: "bold",
    color: "white",
  },
});

export default Filter;
