import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Downloads and saves a file.
 * @param fileUrl The URL of the file to download.
 * @param filename The name of the file to save.
 * @param updateStatus Optional callback to update the UI with status messages.
 */
export async function downloadAndSaveDocument(
  fileUrl: string,
  filename: string,
  updateStatus?: (status: string) => void
) {
  try {
    // Update status: Downloading
    updateStatus?.("Downloading...");
    const result = await FileSystem.downloadAsync(
      fileUrl,
      FileSystem.documentDirectory + filename
    );

    // Update status: Saving
    updateStatus?.("Saving file...");
    await saveFile(result.uri, filename, result.headers["Content-Type"]);

    // Success message
    updateStatus?.("File saved successfully!");
  } catch (error) {
    console.error("Error:", error);
    updateStatus?.("Failed to download/save file.");
  }
}

/**
 * Saves a file to the device's storage.
 * @param uri The URI of the file to save.
 * @param filename The name to save the file as.
 * @param mimetype The MIME type of the file.
 */
export async function saveFile(
  uri: string,
  filename: string,
  mimetype: string
) {
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
        .catch((e) => console.log("Error saving file:", e));
    } else {
      // If permissions are not granted, share the file instead
      await Sharing.shareAsync(uri);
    }
  } else {
    // For iOS, use the sharing functionality
    await Sharing.shareAsync(uri);
  }
}
