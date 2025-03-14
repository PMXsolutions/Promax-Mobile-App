import normalize from "@/libs/normalize";

const colors = {
  white: "#fff",
  black: "#000",
  grayBg: "#64748B",
  inactive: "#B2B0B0",
  primary: "#030637",
  brand: "#030637",
  // brand: "#405189",
  secondary: "#FCBA34",
  dark: "#222222",
  red: "#A50900",
  light: "#F3F4FB",
  lightGray: "#E2E8F0",
  yellow: "#FFFF00",
  border: "#CBD5E1",
  apply: "#FCB889",
  neutral: {
    300: "#525252",
    400: "#7B7B7B",
  },
  green: "#6DC347",
  error: "#E80D0D",
  success: "#6DC347",
  toastText: {
    success: "#00A11F",
    error: "#A11300",
  },
  toastBg: {
    success: "#DAF1DF",
    error: "#F1DADA",
  },
  borderLight: "#F7F7F7",
  border_alt: "#B2B0B0",
} as const;

const spacing = {
  xs: 4,
  sm: normalize(8),
  md: normalize(14),
  lg: normalize(22),
  xl: normalize(30),
  /** Screen horizontal padding */
  gutter: normalize(18),
} as const;

const fontFamily = {
  thin: "Inter_100Thin",
  extraLight: "Inter_200ExtraLight",
  light: "Inter_300Light",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
  black: "Inter_900Black",
} as const;

// const fontSize = {
//   xs: normalize(7),
//   sm: normalize(9),
//   md: normalize(11),
//   base: normalize(12),
//   lg: normalize(13),
//   xl: 18,
//   "2xl": 20,
//   "3xl": 24,
// } as const;
const fontSize = {
  xs: 10, // Extra Small
  sm: 12, // Small
  md: 14, // Medium
  base: 16, // Default Body Text
  lg: 18, // Large
  xl: 20, // Extra Large
  "2xl": 24, // 2x Extra Large
  "3xl": 30, // 3x Extra Large
} as const;

export const THEME = {
  colors,
  spacing,
  fontFamily,
  fontSize,
};

export const customTheme = {
  backgroundColor: "#ffffff",
  calendarBackground: "#ffffff",
  textSectionTitleColor: "#b6c1cd",
  textSectionTitleDisabledColor: "#d9e1e8",
  selectedDayBackgroundColor: THEME.colors.brand,
  selectedDayTextColor: "#ffffff",
  todayTextColor: THEME.colors.brand,
  dayTextColor: THEME.colors.primary,
  textDisabledColor: "#d9e1e8",
  dotColor: THEME.colors.brand,
  selectedDotColor: "#ffffff",
  arrowColor: THEME.colors.secondary,
  disabledArrowColor: "#d9e1e8",
  monthTextColor: THEME.colors.brand,
  indicatorColor: THEME.colors.brand,
  textDayFontFamily: THEME.fontFamily.regular,
  textMonthFontFamily: THEME.fontFamily.regular,
  textDayHeaderFontFamily: THEME.fontFamily.regular,
  textDayFontWeight: "300",
  textMonthFontWeight: "bold",
  textDayHeaderFontWeight: "300",
  textDayFontSize: normalize(13),
  textMonthFontSize: normalize(12),
  textDayHeaderFontSize: normalize(11),
  todayBackgroundColor: THEME.colors.secondary,
};
