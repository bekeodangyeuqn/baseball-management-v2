import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import {
  atom,
  selector,
  selectorFamily,
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";
import axiosInstance from "../lib/axiosClient";

export const transactionsState = atom({
  key: "TransactionsState",
  default: [],
});

// Selector to get a game by ID
export const transactionByIdState = selector({
  key: "TransactionByIdState",
  get:
    ({ get }) =>
    (id) =>
      get(transactionByIdState).find((transaction) => transaction.id === id),
});

export const fetchTransactionsState = selectorFamily({
  key: "TransactionsAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const { data } = await axiosInstance.get(`/transactions/team/${teamid}/`);
      AsyncStorage.setItem("transactions", JSON.stringify(data), (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Transactions stored successfully.");
        }
      });
      return data;
    },
});
