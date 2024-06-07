import { useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { GiftedChat } from "react-native-gifted-chat";
import { useRecoilState } from "recoil";
import { messagesState } from "../atom/Messages";

const splitAvatarURI = (str) => {
  const arr = str.split("?");
  return arr[0];
};

const ChatBotScreen = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [outputMessage, setOutputMessage] = useState("Result");
  const route = useRoute();
  const username = route.params.username;
  const avatar = route.params.avatar;
  const [messages, setMessages] = useRecoilState(messagesState);
  const inputRef = useRef(null);

  const handleButtonClick = () => {
    console.log(
      process.env.EXPO_PUBLIC_COZE_TOKEN,
      process.env.EXPO_PUBLIC_BOT_ID
    );
    Keyboard.dismiss();
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: {
        _id: 1,
        name: username,
        avatar: avatar
          ? splitAvatarURI(avatar)
          : "https://cdn0.iconfinder.com/data/icons/baseball-filledoutline/64/baseball_player-user-boy-sports-avatar-profile-man-people-coach-512.png",
      },
    };
    setMessages((prev) => GiftedChat.append(prev, [message]));
    setInputMessage("");
    inputRef.current.clear();
    fetch("https://api.coze.com/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_COZE_TOKEN}`,
        Host: "api.coze.com",
        Connection: "keep-alive",
        Accept: "*/*",
      },
      body: JSON.stringify({
        conversation_id: "123",
        bot_id: `${process.env.EXPO_PUBLIC_BOT_ID}`,
        user: `123333333`,
        query: `${inputMessage}`,
        stream: false,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        let content = data.messages[1].content.trim();
        let i = 2;
        while (content.includes("{")) {
          content = data.messages[i].content.trim();
          i++;
        }

        setOutputMessage(content);
        const message = {
          _id: Math.random().toString(36).substring(7),
          text: content,
          createdAt: new Date(),
          user: { _id: 2, name: "Bot" },
        };
        setMessages((prev) => GiftedChat.append(prev, [message]));
      });
  };

  useEffect(() => {
    if (messages.length <= 0)
      setMessages((prev) => [
        {
          _id: 1,
          text: "Xin chào, tôi là một chat bot chuyên tìm kiếm các thông tin liên quan tới bóng chày. Tôi sẽ giúp bạn tìm kiếm và trả lời các câu hỏi liên quan đến bóng chày.",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "Bot",
          },
        },
      ]);
  }, []);

  const handleTextInput = (text) => {
    setInputMessage(text);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <GiftedChat
          messages={messages}
          renderInputToolbar={() => {}}
          user={{ _id: 1 }}
          minInputToolbarHeight={0}
        />
      </View>
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            flex: 1,
            marginBottom: 20,
            backgroundColor: "white",
            borderRadius: 10,
            borderColor: "grey",
            borderWidth: 1,
            height: 60,
            marginLeft: 10,
            marginRight: 10,
            justifyContent: "center",
            paddingLeft: 10,
            paddingRight: 10,
          }}
        >
          <TextInput
            placeholder="Nhập câu hỏi"
            onChangeText={handleTextInput}
            ref={inputRef}
          />
        </View>
        <TouchableOpacity onPress={() => handleButtonClick()}>
          <View
            style={{
              backgroundColor: "green",
              padding: 5,
              marginRight: 10,
              marginBottom: 20,
              borderRadius: 9999,
              width: 60,
              height: 60,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="send" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChatBotScreen;
