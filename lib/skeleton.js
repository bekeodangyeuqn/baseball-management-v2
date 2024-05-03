import { useMemo } from "react";

export const placeholderList = Array.from({ length: 15 }).map((_) => null);

export const SkeletonCommonProps = {
  colorMode: "light",
  transition: {
    type: "timing",
    duration: 1500,
  },
  backgroundColor: "#D4D4D4",
};
