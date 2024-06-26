import { atom, selector, selectorFamily } from "recoil";

export const myGamePlayers = atom({
  key: "MyGamePlayers",
  default: [],
});

export const myGamePlayersByGameId = selectorFamily({
  key: "GamePlayersByGameId",
  get: (gameid) => {
    return ({ get }) => {
      const players = get(myGamePlayers);
      return players.filter((obj) => {
        if (obj.gameid) return obj.gameid === gameid;
        else return obj.game_id === gameid;
      });
    };
  },
});

export const myBattingOrder = selectorFamily({
  key: "MyGameBattingOrder",
  get:
    (gameid) =>
    ({ get }) => {
      const gamePlayers = get(myGamePlayersByGameId(gameid));
      return gamePlayers.length === 10
        ? gamePlayers.filter((obj) => obj.position !== 1)
        : gamePlayers;
    },
});
