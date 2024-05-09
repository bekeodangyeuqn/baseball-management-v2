import AsyncStorage from "@react-native-async-storage/async-storage";
import { useResetRecoilState } from "recoil";
import { atBatsState } from "../atom/AtBats";
import { equipmentsState } from "../atom/Equipments";
import { eventsState } from "../atom/Events";
import { managersState, playersState } from "../atom/Players";
import { myGamePlayers } from "../atom/GamePlayers";
import { gamesState } from "../atom/Games";
import { transactionsState } from "../atom/Transactions";
import { teamsState } from "../atom/Teams";

export function useLogout() {
  const resetYourRecoilState1 = useResetRecoilState(atBatsState);
  const resetYourRecoilState2 = useResetRecoilState(equipmentsState);
  const resetYourRecoilState3 = useResetRecoilState(eventsState);
  const resetYourRecoilState4 = useResetRecoilState(myGamePlayers);
  const resetYourRecoilState5 = useResetRecoilState(gamesState);
  const resetYourRecoilState6 = useResetRecoilState(playersState);
  const resetYourRecoilState7 = useResetRecoilState(teamsState);
  const resetYourRecoilState8 = useResetRecoilState(managersState);
  const resetYourRecoilState9 = useResetRecoilState(transactionsState);

  return async (navigation) => {
    try {
      await AsyncStorage.clear();
      resetYourRecoilState1();
      resetYourRecoilState2();
      resetYourRecoilState3();
      resetYourRecoilState4();
      resetYourRecoilState5();
      resetYourRecoilState6();
      resetYourRecoilState7();
      resetYourRecoilState8();
      resetYourRecoilState9();
      // Add more reset functions here if you have more Recoil states
      navigation.navigate("Login");
    } catch (e) {
      console.error(e);
    }
  };
}
