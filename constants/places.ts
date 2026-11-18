import { Platform } from "react-native";

const packageName = "au.com.promaxsolutions.promaxcare";
const androidCertificate = (process.env.EXPO_PUBLIC_ANDROID_SIGNING_CERT_SHA1 ?? "").replace(/:/g, "");

export const placesConfiguration = {
  apiKey: Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_GOOGLE_PLACES_IOS_API_KEY ?? ""
    : process.env.EXPO_PUBLIC_GOOGLE_PLACES_ANDROID_API_KEY ?? "",
  requestUrl: {
    useOnPlatform: "all" as const,
    url: "https://places.googleapis.com",
    headers: {
      "Content-Type": "application/json",
      ...(Platform.OS === "ios"
        ? { "X-Ios-Bundle-Identifier": packageName }
        : { "X-Android-Package": packageName, "X-Android-Cert": androidCertificate }),
    } as Record<string, string>,
  },
};
