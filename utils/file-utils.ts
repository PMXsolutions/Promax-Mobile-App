import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Downloads and saves a file.
 * @param fileUrl The URL of the file to download.
 * @param filename The name of the file to save.
 * @param updateStatus Optional callback to update the UI with status messages.
 */
// export async function downloadAndSaveDocument(
//   fileUrl: string,
//   filename: string,
//   updateStatus?: (status: string) => void
// ) {
//   try {
//     // Update status: Downloading
//     updateStatus?.("Downloading...");
//     const result = await FileSystem.downloadAsync(
//       fileUrl,
//       FileSystem.documentDirectory + filename
//     );

//     console.log("Downloaded File Headers:", result.headers);
//     console.log("Detected MIME Type:", result.headers["Content-Type"]); // Check if it's null or undefined

//     // Update status: Saving
//     updateStatus?.("Saving file...");
//     await saveFile(result.uri, filename, result.headers["Content-Type"]);

//     // Success message
//     updateStatus?.("File saved successfully!");
//   } catch (error) {
//     console.error("Error:", error);
//     updateStatus?.("Failed to download/save file.");
//   }
// }
export async function downloadAndSaveDocument(
  fileUrl: string,
  filename: string,
  updateStatus?: (status: string) => void
) {
  try {
    updateStatus?.("Downloading...");
    const result = await FileSystem.downloadAsync(
      fileUrl,
      FileSystem.documentDirectory + filename
    );

    // console.log("Downloaded File Headers:", result.headers);

    // Ensure we get the correct MIME type
    const contentType =
      result.headers["content-type"] || "application/octet-stream";
    // console.log("Detected MIME Type:", contentType);

    updateStatus?.("Saving file...");
    await saveFile(result.uri, filename, contentType);

    updateStatus?.("File saved successfully!");
  } catch (error) {
    // console.error("Error:", error);
    updateStatus?.("Failed to download/save file.");
  }
}

/**
 * Saves a file to the device's storage.
 * @param uri The URI of the file to save.
 * @param filename The name to save the file as.
 * @param mimetype The MIME type of the file.
 */
// export async function saveFile(
//   uri: string,
//   filename: string,
//   mimetype: string
// ) {
//   if (Platform.OS === "android") {
//     const permissions =
//       await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

//     if (permissions.granted) {
//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       await FileSystem.StorageAccessFramework.createFileAsync(
//         permissions.directoryUri,
//         filename,
//         mimetype
//       )
//         .then(async (uri) => {
//           await FileSystem.writeAsStringAsync(uri, base64, {
//             encoding: FileSystem.EncodingType.Base64,
//           });
//         })
//         .catch((e) => console.log("Error saving file:", e));
//     } else {
//       // If permissions are not granted, share the file instead
//       await Sharing.shareAsync(uri);
//     }
//   } else {
//     // For iOS, use the sharing functionality
//     await Sharing.shareAsync(uri);
//   }
// }

export async function saveFile(
  uri: string,
  filename: string,
  mimetype: string | null | undefined // Allow null but provide fallback
) {
  if (Platform.OS === "android") {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Fallback MIME type if it's null or undefined
      const safeMimeType = mimetype || "application/pdf";

      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        safeMimeType
      )
        .then(async (fileUri) => {
          await FileSystem.writeAsStringAsync(fileUri, base64, {
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

export const saveBase64AsFile = async (
  base64String: string,
  fileName: string
) => {
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

  await FileSystem.writeAsStringAsync(fileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};
