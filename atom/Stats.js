import { atom, selectorFamily } from "recoil";

// Atom to store the games
export const statsState = atom({
  key: "statsState",
  default: null,
});
