import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import * as FileSystem from "expo-file-system/legacy";

export const pickImageOrUseCamera = async (): Promise<string | undefined> => {
  // Ask the user if they want to pick from gallery or use camera
  return new Promise((resolve) => {
    Alert.alert(
      "Choose Image Source",
      "Would you like to select a picture from your gallery or take a new one?",
      [
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => resolve(undefined),
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const result = await pickImage();
            resolve(result);
          },
        },
        {
          text: "Take a Photo",
          onPress: async () => {
            const result = await takePhoto();
            resolve(result);
          },
        },
      ]
    );
  });
};

const pickImage = async (): Promise<string | undefined> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission denied",
      "Sorry, we need camera roll permissions to make this work!"
    );
    return undefined;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }

  return undefined;
};

const takePhoto = async (): Promise<string | undefined> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Permission denied",
      "Sorry, we need camera permissions to make this work!"
    );
    return undefined;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }

  return undefined;
};
export const resizeImage = async (uri: string) => {
  // const manipulatedImage = await ImageManipulator.manipulateAsync(
  //   uri,
  //   [{ resize: { width: 500 } }], // Resize to width of 500, height will adjust automatically
  //   { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  // );

  const manipResult = await manipulateAsync(uri, [{ resize: { width: 500 } }], {
    compress: 0.7,
    format: SaveFormat.PNG,
  });
  return manipResult.uri;
};

export const uploadDoc = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "image/jpeg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (!result.canceled) {
      return result.assets[0];
    } else {
      showMessage({
        type: "danger",
        message: "Document selection cancelled",
      });
    }
  } catch (error) {
    showMessage({
      type: "danger",
      message: "Error selecting document: ",
    });
  }
};

// Then, use the following code to convert an image to base64:

export const convertImageToBase64 = async (fileUri: string) => {
  try {
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64Data;
  } catch (error) {
    console.error("Error converting image to base64:", error);

    return null;
  }
};
