import { atom, selectorFamily } from "recoil";

// Atom to store the games
export const messagesState = atom({
  key: "MessagesState",
  default: [],
});
