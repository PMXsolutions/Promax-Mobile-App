const appJson = require("./app.json");

const androidMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
const iosMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY;

module.exports = () => {
  const apiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASEURL ||
    "https://api.promaxcare.com.au/api";

  const expo = {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      apiBaseUrl,
    },
    ios: {
      ...appJson.expo.ios,
      ...(iosMapsApiKey
        ? {
            config: {
              ...appJson.expo.ios?.config,
              googleMapsApiKey: iosMapsApiKey,
            },
          }
        : {}),
    },
    android: {
      ...appJson.expo.android,
      // EAS file variables expose a temp path, not the JSON contents.
      // Local builds keep the gitignored ./google-services.json path.
      ...(process.env.GOOGLE_SERVICES_JSON
        ? { googleServicesFile: process.env.GOOGLE_SERVICES_JSON }
        : {}),
      ...(androidMapsApiKey
        ? {
            config: {
              ...appJson.expo.android?.config,
              googleMaps: {
                ...appJson.expo.android?.config?.googleMaps,
                apiKey: androidMapsApiKey,
              },
            },
          }
        : {}),
    },
  };

  return { expo };
};
