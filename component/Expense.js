import React from "react";
import { View, StyleSheet } from "react-native";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  eq,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// import { withTransition } from "react-native-redash";
import Delete from "./Delete";
import { useTiming } from "react-native-redash";
import { Box, Text } from "./theme";

const Expense = ({
  index,
  active,
  onTap,
  onDelete,
  item,
  allDates,
  player,
}) => {
  // const value = active.__getValue();
  const isActive = useDerivedValue(() => (active === index ? 1 : 0));

  const activeTransition = useTiming(isActive.value, {
    duration: 200,
  });

  const delX = interpolate(activeTransition.value, [0, 1], [-100, 20]);

  const hidePrice = interpolate(activeTransition.value, [0, 1], [1, 0]);
  console.log(active, index);
  const tranType = [
    "",
    "Được tặng quà",
    "Tiền thưởng từ giải đấu",
    "Đóng quỹ",
    "Khoản thu khác",
    "Khoảng chi khác",
    "Tặng quà cho thành viên",
    "Tổ chức sự kiện",
    "Mua dụng cụ",
  ];

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          onTap();
        }}
      >
        <Animated.View>
          <Box
            overflow="hidden"
            paddingHorizontal="l"
            borderBottomWidth={1}
            borderBottomColor="silver"
            height={50}
            position="relative"
          >
            <View style={[StyleSheet.absoluteFill, {}]}>
              <Animated.View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                  alignItems: "center",
                  height: 50,
                  padding: 16,
                }}
              >
                <Animated.Text>
                  {item.type > 0
                    ? tranType[item.type]
                    : tranType[tranType.length + item.type]}
                </Animated.Text>
                <Animated.Text
                  style={{
                    opacity: hidePrice ? hidePrice : 0,
                    color: item.type > 0 ? "#009BFC" : "#FF4500",
                  }}
                >
                  {item.price > 0
                    ? `${item.price}₫`
                    : `- ${Math.abs(item.price)}₫`}
                </Animated.Text>
              </Animated.View>
              {item.type === 3 ? (
                <Animated.Text>
                  {player
                    ? `Người đóng quỹ: #${player.jerseyNumber}.${player.firstName} ${player.lastName}`
                    : "A"}{" "}
                </Animated.Text>
              ) : null}
            </View>

            <Animated.View
              style={{
                fontSize: 12,
                color: "white",
                fontWeight: "900",
                position: "absolute",
                height: 50,
                width: "14%",
                right: delX ? delX : 0,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "white",
              }}
            >
              <Text>
                <TouchableOpacity
                  onPress={() => {
                    onDelete(index);
                  }}
                >
                  <Delete />
                  {/* <Text>Delete</Text> */}
                </TouchableOpacity>
              </Text>
            </Animated.View>
          </Box>
        </Animated.View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  icon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flex: 1,
  },
});

export default Expense;
