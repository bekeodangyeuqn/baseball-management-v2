import { atom } from "recoil";

export const myGamePlayers = atom({
  key: "MyGamePlayers",
  default: [],
});

export const myBattingOrder = atom({
  key: "MyBattingOrder",
  default:
    myGamePlayers.length === 10
      ? myGamePlayers.filter((obj) => obj.position !== 1)
      : myGamePlayers,
});
