import { atom, selector, selectorFamily } from "recoil";
import axiosInstance from "../lib/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Atom to store the games
export const eventsState = atom({
  key: "eventsState",
  default: [],
});

export const personsEventsState = atom({
  key: "PersonsEventsState",
  default: [],
});

// Selector to get a game by ID
export const eventByIdState = selectorFamily({
  key: "eventByIdState",
  get:
    (id) =>
    ({ get }) =>
      get(eventsState).find((event) => event.id === id),
});

export const fetchEventsState = selectorFamily({
  key: "EventsAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const { data } = await axiosInstance.get(`/events/team/${teamid}/`);
      AsyncStorage.setItem("events", JSON.stringify(data), (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Events stored successfully.");
        }
      });
      return data;
    },
});
