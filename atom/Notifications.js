import { atom, selectorFamily } from "recoil";

// Atom to store the games
export const notificationsState = atom({
  key: "NotificationsState",
  default: [],
});
