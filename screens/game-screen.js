import React from "react";
import Scoreboard from "../component/Scoreboard";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const hro = {
  logo: "https://scontent.fhan14-4.fna.fbcdn.net/v/t39.30808-6/357465020_6804779056213062_3110513268257820850_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=5f2048&_nc_ohc=Y28z80y0_WUAX9u4W4u&_nc_ht=scontent.fhan14-4.fna&oh=00_AfAdOweIpsD44Ey0VMgIe1ZfkDoibSW_FBrOrN0rXMgK9w&oe=6536280A",
  name: "Red Owls",
};

const ulis = {
  logo: "https://scontent.fhan14-4.fna.fbcdn.net/v/t39.30808-6/358039530_6804777216213246_1017272911201231647_n.jpg?stp=dst-jpg_p600x600&_nc_cat=111&ccb=1-7&_nc_sid=5f2048&_nc_ohc=NrghHt6a8LgAX-umDap&_nc_ht=scontent.fhan14-4.fna&oh=00_AfBZBd-SW5fq2b-OLyPpBUw33D68tKtY4yUz5pAHeloG3A&oe=6535EFCA",
  name: "Devil Bats",
};

const archers = {
  logo: "https://scontent.fhan11-1.fna.fbcdn.net/v/t39.30808-6/357742725_6804770299547271_2598896853062292630_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=5f2048&_nc_ohc=7H3_UpwHOTMAX-tqoEr&_nc_ht=scontent.fhan11-1.fna&oh=00_AfBSNg1LbbESr0oiVKFDWuy_YMLNOpVKNVO6g7RIYFEBfw&oe=6535F8D7",
  name: "Archers",
};
const GameScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Scoreboard
        away={hro}
        home={ulis}
        awayScore={7}
        homeScore={6}
      ></Scoreboard>
      <Scoreboard
        away={hro}
        home={archers}
        awayScore={4}
        homeScore={25}
      ></Scoreboard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
export default GameScreen;
