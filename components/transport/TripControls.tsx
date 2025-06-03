import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";

type TripControlsProps = {
  state: "IDLE" | "STARTED" | "PAUSED" | "STOPPED";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

export default function TripControls({
  state,
  onStart,
  onPause,
  onResume,
  onStop,
}: TripControlsProps) {
  return (
    <View style={styles.container}>
      {state === "IDLE" && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <FontAwesome6 name="play" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.label}>Start Trip</Text>
        </View>
      )}

      {state === "STARTED" && (
        <View style={styles.activeContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
              <MaterialIcons name="pause" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.label}>Pause</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.stopButton} onPress={onStop}>
              <MaterialIcons name="stop" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.label}>Stop Trip</Text>
          </View>
        </View>
      )}

      {state === "PAUSED" && (
        <View style={styles.activeContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resumeButton} onPress={onResume}>
              <FontAwesome6 name="play" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.label}>Resume</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.stopButton} onPress={onStop}>
              <MaterialIcons name="stop" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.label}>Stop Trip</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  activeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  buttonContainer: {
    alignItems: "center",
    gap: 8,
  },
  startButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2E7D32", // Green for start
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF9800", // Orange for pause
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  resumeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4CAF50", // Lighter green for resume
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#D32F2F", // Red for stop
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  label: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
