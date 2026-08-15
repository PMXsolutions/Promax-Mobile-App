export type DeploymentEnvironment = "development" | "uat" | "production";

export type RuntimeConfiguration = {
  environment: DeploymentEnvironment;
  apiBaseUrl: string;
};

const nonProductionHostMarkers = [
  "apitest.",
  "uat.",
  "staging.",
  "test.",
  "localhost",
  "127.0.0.1",
];

export function validateRuntimeConfiguration(args: {
  environment?: string;
  apiBaseUrl?: string;
}): RuntimeConfiguration {
  const environment = (args.environment || "").trim().toLowerCase();
  const apiBaseUrl = (args.apiBaseUrl || "").trim().replace(/\/+$/, "");

  if (!["development", "uat", "production"].includes(environment)) {
    throw new Error(
      "EXPO_PUBLIC_DEPLOYMENT_ENV must be development, uat, or production."
    );
  }
  if (!apiBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASEURL is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(apiBaseUrl);
  } catch {
    throw new Error("EXPO_PUBLIC_API_BASEURL must be a valid absolute URL.");
  }

  const isLocalDevelopment =
    environment === "development" &&
    ["localhost", "127.0.0.1"].includes(parsed.hostname.toLowerCase());
  if (parsed.protocol !== "https:" && !isLocalDevelopment) {
    throw new Error("The mobile API must use HTTPS outside local development.");
  }
  if (!parsed.pathname.toLowerCase().endsWith("/api")) {
    throw new Error("EXPO_PUBLIC_API_BASEURL must include the /api suffix.");
  }

  const host = parsed.hostname.toLowerCase();
  const looksNonProduction = nonProductionHostMarkers.some((marker) =>
    host.includes(marker)
  );
  if (environment === "production" && looksNonProduction) {
    throw new Error("A production mobile build cannot use a non-production API.");
  }
  if (environment === "uat" && !looksNonProduction) {
    throw new Error("A UAT mobile build cannot use a production-looking API.");
  }

  return {
    environment: environment as DeploymentEnvironment,
    apiBaseUrl,
  };
}

export function readRuntimeConfiguration(): RuntimeConfiguration {
  return validateRuntimeConfiguration({
    environment: process.env.EXPO_PUBLIC_DEPLOYMENT_ENV,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASEURL,
  });
}
