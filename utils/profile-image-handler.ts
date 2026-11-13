import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import * as FileSystem from "expo-file-system";

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

export type PickedDocument = {
  uri: string;
  name: string;
  mimeType: string | null;
};

const COMPLIANCE_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const imageToDocument = async (
  uri: string,
  mimeType?: string | null,
  fileName?: string | null
): Promise<PickedDocument> => {
  const lowerName = fileName?.toLowerCase() || "";
  const isHeic =
    mimeType === "image/heic" ||
    mimeType === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif");

  if (isHeic) {
    const converted = await manipulateAsync(uri, [], {
      compress: 0.8,
      format: SaveFormat.JPEG,
    });
    return {
      uri: converted.uri,
      name: `document-${Date.now()}.jpg`,
      mimeType: "image/jpeg",
    };
  }

  const extension = mimeType === "image/png" ? "png" : "jpg";
  return {
    uri,
    name: fileName || `document-${Date.now()}.${extension}`,
    mimeType: mimeType || (extension === "png" ? "image/png" : "image/jpeg"),
  };
};

const captureDocumentPhoto = async (): Promise<PickedDocument | undefined> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission denied",
      "Camera access is needed to photograph a document."
    );
    return undefined;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.[0]) return undefined;
  const asset = result.assets[0];
  return imageToDocument(asset.uri, asset.mimeType, asset.fileName);
};

const pickDocumentImage = async (): Promise<PickedDocument | undefined> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permission denied",
      "Photo library access is needed to choose a document image."
    );
    return undefined;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.[0]) return undefined;
  const asset = result.assets[0];
  return imageToDocument(asset.uri, asset.mimeType, asset.fileName);
};

const pickDocumentFile = async (): Promise<PickedDocument | undefined> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: COMPLIANCE_FILE_TYPES,
  });
  if (result.canceled || !result.assets?.[0]) return undefined;
  const asset = result.assets[0];
  if (asset.mimeType?.startsWith("image/") || /\.(jpe?g|png|heic|heif)$/i.test(asset.name || "")) {
    return imageToDocument(asset.uri, asset.mimeType, asset.name);
  }
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? null,
  };
};

export const uploadDoc = async (): Promise<PickedDocument | undefined> => {
  try {
    return await new Promise((resolve) => {
      Alert.alert("Add a document", "Take a photo or choose a file.", [
        { text: "Cancel", style: "cancel", onPress: () => resolve(undefined) },
        {
          text: "Take photo",
          onPress: () => {
            void captureDocumentPhoto().then(resolve);
          },
        },
        {
          text: "Photo library",
          onPress: () => {
            void pickDocumentImage().then(resolve);
          },
        },
        {
          text: "Choose file",
          onPress: () => {
            void pickDocumentFile().then(resolve);
          },
        },
      ]);
    });
  } catch (error) {
    showMessage({
      type: "danger",
      message: "Error selecting document",
    });
    return undefined;
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
