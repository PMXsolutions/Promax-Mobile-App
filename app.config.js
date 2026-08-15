const appJson = require("./app.json");
const fs = require("fs");

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const configuredGoogleServicesFile = process.env.GOOGLE_SERVICES_JSON;
const localGoogleServicesFile = "./google-services.json";
const googleServicesFile = configuredGoogleServicesFile ||
  (fs.existsSync(localGoogleServicesFile) ? localGoogleServicesFile : undefined);
const deploymentEnvironment = (
  process.env.EXPO_PUBLIC_DEPLOYMENT_ENV || "development"
).toLowerCase();
const nonProductionSuffix =
  deploymentEnvironment === "production"
    ? ""
    : deploymentEnvironment === "uat"
      ? ".uat"
      : ".dev";
const displayName =
  deploymentEnvironment === "production"
    ? appJson.expo.name
    : deploymentEnvironment === "uat"
      ? "PromaxCare UAT"
      : "PromaxCare Dev";

module.exports = () => {
  const { googleServicesFile: _ignoredCommittedPath, ...androidBase } =
    appJson.expo.android;
  const expo = {
    ...appJson.expo,
    name: displayName,
    scheme:
      deploymentEnvironment === "production"
        ? appJson.expo.scheme
        : `promaxcare-${deploymentEnvironment}`,
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: `${appJson.expo.ios.bundleIdentifier}${nonProductionSuffix}`,
      ...(googleMapsApiKey
        ? {
            config: {
              ...appJson.expo.ios?.config,
              googleMapsApiKey,
            },
          }
        : {}),
    },
    android: {
      ...androidBase,
      package: `${appJson.expo.android.package}${nonProductionSuffix}`,
      ...(googleServicesFile ? { googleServicesFile } : {}),
      ...(googleMapsApiKey
        ? {
            config: {
              ...appJson.expo.android?.config,
              googleMaps: {
                ...appJson.expo.android?.config?.googleMaps,
                apiKey: googleMapsApiKey,
              },
            },
          }
        : {}),
    },
  };

  return { expo };
};
