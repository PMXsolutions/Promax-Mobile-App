// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist*/**", ".expo/**"],
    rules: {
      // React Native Animated and Reanimated intentionally keep mutable native
      // handles. These compiler-oriented rules misclassify those established
      // patterns, while the core Rules of Hooks remain enabled.
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      // React Hook Form exposes subscriptions that the compiler cannot memoize;
      // this app does not opt into the experimental React compiler.
      "react-hooks/incompatible-library": "off",
    },
  }
]);
