import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import EmptyList from "../component/EmptyList";
import NotificationItem from "../component/NotificationItem";
import { useRoute } from "@react-navigation/native";

const NotificationScreen = () => {
  const route = useRoute();
  const notifications = route.params.notifications;
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <FlatList
          data={notifications}
          ListEmptyComponent={<EmptyList />}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => <NotificationItem notification={item} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default NotificationScreen;
