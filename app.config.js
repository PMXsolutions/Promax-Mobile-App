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
module.exports = ({ config }) => {
  const displayName =
    deploymentEnvironment === "production"
      ? config.name
      : deploymentEnvironment === "uat"
        ? "PromaxCare UAT"
        : "PromaxCare Dev";
  const { googleServicesFile: _ignoredCommittedPath, ...androidBase } =
    config.android;
  const expo = {
    ...config,
    name: displayName,
    scheme:
      deploymentEnvironment === "production"
        ? config.scheme
        : `promaxcare-${deploymentEnvironment}`,
    ios: {
      ...config.ios,
      bundleIdentifier: `${config.ios.bundleIdentifier}${nonProductionSuffix}`,
      ...(googleMapsApiKey
        ? {
            config: {
              ...config.ios?.config,
              googleMapsApiKey,
            },
          }
        : {}),
    },
    android: {
      ...androidBase,
      package: `${config.android.package}${nonProductionSuffix}`,
      ...(googleServicesFile ? { googleServicesFile } : {}),
      ...(googleMapsApiKey
        ? {
            config: {
              ...config.android?.config,
              googleMaps: {
                ...config.android?.config?.googleMaps,
                apiKey: googleMapsApiKey,
              },
            },
          }
        : {}),
    },
  };

  return expo;
};
