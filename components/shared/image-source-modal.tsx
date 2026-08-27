// components/shared/image-source-modal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { THEME } from "@/constants/theme";

interface Props {
  visible: boolean;
  onSelect: (source: "camera" | "gallery" | "cancel") => void;
  title?: string;
}

export const ImageSourceModal: React.FC<Props> = ({
  visible,
  onSelect,
  title = "Select Image Source",
}) => {
  const options = [
    {
      key: "camera" as const,
      label: "Take Photo",
      icon: "📷",
      description: "Use camera to take a new photo",
    },
    {
      key: "gallery" as const,
      label: "Choose from Gallery",
      icon: "🖼️",
      description: "Select from your photo library",
    },
  ];

  const handleOptionPress = (source: "camera" | "gallery") => {
    // Add slight delay for better UX feedback
    setTimeout(() => onSelect(source), 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => onSelect("cancel")}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="rgba(0,0,0,0.6)" barStyle="light-content" />

        {/* Backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={() => onSelect("cancel")}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
        >
          {/* Modal Content */}
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                Choose how you’d like to add an image
              </Text>
            </View>

            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionButton}
                  onPress={() => handleOptionPress(option.key)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityHint={option.description}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onSelect("cancel")}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    minHeight: 280,
    maxHeight: "50%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.colors.grayBg || "#1A1A1A",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  cancelButton: {
    backgroundColor: "#F1F3F4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5F6368",
  },
});

export default ImageSourceModal;
