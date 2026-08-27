import React from "react";
import { StyleSheet, View } from "react-native";

import Text from "@/components/shared/text";
import { Coord } from "@/types/map";

export default function MapViewTrip({
  route,
  destination,
  initialPosition,
}: {
  route: Coord[];
  destination: Coord | null;
  setDestination: (coord: Coord) => void;
  initialPosition: Coord | null;
}) {
  return (
    <View accessibilityLabel="Trip location summary" style={styles.container}>
      <Text weight="bold" style={styles.title}>
        Trip map
      </Text>
      <Text style={styles.body}>
        {initialPosition
          ? "Your starting position is available."
          : "Waiting for your starting position."}
      </Text>
      <Text style={styles.body}>
        {destination
          ? "A destination has been selected."
          : "Search for a destination above to continue."}
      </Text>
      {route.length > 0 ? (
        <Text style={styles.route}>{route.length} route points recorded</Text>
      ) : null}
      <Text style={styles.note}>
        Live trip mapping and location tracking are available in the iOS and
        Android app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 320,
    padding: 28,
    backgroundColor: "#edf4f1",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, color: "#153f38", marginBottom: 14 },
  body: { color: "#40534e", lineHeight: 22, textAlign: "center" },
  route: { color: "#167447", marginTop: 8 },
  note: {
    maxWidth: 460,
    color: "#66736f",
    lineHeight: 21,
    textAlign: "center",
    marginTop: 20,
  },
});
