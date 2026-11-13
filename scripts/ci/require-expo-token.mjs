if (!process.env.EXPO_TOKEN) {
  console.error(
    "The EXPO_TOKEN GitHub repository secret is not set. EAS authentication is unavailable."
  );
  process.exit(1);
}

console.log("EXPO_TOKEN is set.");
