import { atom, selector, selectorFamily } from "recoil";
import axiosInstance from "../lib/axiosClient";

// Atom to store the games
export const managersState = atom({
  key: "managersState",
  default: [],
});

// Selector to get a game by ID
export const managerByIdState = selector({
  key: "managerByIdState",
  get:
    ({ get }) =>
    (id) =>
      get(gamesState).find((game) => game.id === id),
});

// Selector to fetch games from API
export const fetchManagersState = selectorFamily({
  key: "ManagersAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const storedManagers = await AsyncStorage.getItem("managers");
      if (storedManagers) {
        const data = JSON.parse(storedManagers);
        return data;
      } else {
        const { data } = await axiosInstance.get(`/managers/team/${teamid}/`);
        AsyncStorage.setItem("managers", JSON.stringify(data), (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Managers stored successfully.");
          }
        });
        return data;
      }
    },
});
