import { atom, selector } from "recoil";
import axios from "axios";

// Atom to store the games
export const gamesState = atom({
  key: "gamesState",
  default: [],
});

// Selector to get a game by ID
export const gameByIdState = selector({
  key: "gameByIdState",
  get:
    ({ get }) =>
    (id) =>
      get(gamesState).find((game) => game.id === id),
});

// Selector to add a game
export const addGameState = selector({
  key: "addGameState",
  set: ({ set, get }, game) => set(gamesState, [...get(gamesState), game]),
});

// Selector to delete a game
export const deleteGameState = selector({
  key: "deleteGameState",
  set: ({ set, get }, id) =>
    set(
      gamesState,
      get(gamesState).filter((game) => game.id !== id)
    ),
});

// Selector to fetch games from API
export const fetchGamesState = selectorFamily({
  key: "PlayersAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const storedGames = await AsyncStorage.getItem("games");
      if (storedPlayers) {
        const data = JSON.parse(storedGames);
        return data;
      } else {
        const { data } = await axiosInstance.get(`/games/team/${teamid}/`);
        AsyncStorage.setItem("games", JSON.stringify(data), (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Games stored successfully.");
          }
        });
        return data;
      }
    },
});
