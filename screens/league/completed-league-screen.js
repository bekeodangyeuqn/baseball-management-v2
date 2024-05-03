import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import EventInfo from "../../component/EventInfo";
import { FlatList } from "react-native-gesture-handler";
import { placeholderList } from "../../lib/skeleton";
import EmptyList from "../../component/EmptyList";

const CompletedLeagueScreen = (props) => {
  const navigation = useNavigation();
  const { leagues, teamName } = props;
  return (
    <View>
      <View style={styles.buttonHeader}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CreateLeague")}
        >
          <Text style={styles.textButton}>Thêm giải đấu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <FlatList
          data={leagues ?? placeholderList}
          ListEmptyComponent={() => <EmptyList />}
          renderItem={({ item, index }) => {
            return (
              <EventInfo
                league={item ? item : null}
                key1={item ? item.id : null}
                title={item ? item.title : null}
                timeStart={item ? item.timeStart : null}
                timeEnd={item ? item.timeEnd : null}
                location={item ? item.location : null}
              />
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  buttonHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    marginBottom: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
  },
  textButton: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default CompletedLeagueScreen;
