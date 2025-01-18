import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";

import { Alert, Platform } from "react-native";
import { showMessage } from "react-native-flash-message";
import * as FileSystem from "expo-file-system";
import { File, Paths, Directory } from "expo-file-system/next";

export const pickImageOrUseCamera = async (): Promise<string | undefined> => {
  // Ask the user if they want to pick from gallery or use camera
  return new Promise((resolve) => {
    Alert.alert(
      "Choose Image Source",
      "Would you like to select a picture from your gallery or take a new one?",
      [
        {
          text: "Cancel",
          style: "cancel",
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
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

// export const downloadAndSaveDocument = async () => {
//   console.log(123);

//   const url = "https://pdfobject.com/pdf/sample.pdf"; // Document URL
//   const destination = new Directory(Paths.cache, "pdfs"); // Destination directory
//   try {
//     destination.create();
//     const output = await File.downloadFileAsync(url, destination);
//     console.log(output.exists); // true
//     console.log(output.uri); // path to the downloaded file, e.g. '${cacheDirectory}/pdfs/sample.pdf'
//   } catch (error) {
//     console.error(error);
//   }
// };

export async function downloadAndSaveDocument() {
  console.log(124);
  const filename = "dummy.pdf";
  const result = await FileSystem.downloadAsync(
    "https://pdfobject.com/pdf/sample.pdf",
    FileSystem.documentDirectory + filename
  );

  // Log the download result
  console.log(result);

  // Save the downloaded file
  saveFile(result.uri, filename, result.headers["Content-Type"]);
}
async function saveFile(uri: string, filename: string, mimetype: string) {
  if (Platform.OS === "android") {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        mimetype
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        })
        .catch((e) => console.log(e));
    } else {
      Sharing.shareAsync(uri);
    }
  } else {
    Sharing.shareAsync(uri);
  }
}
