const blockedHosts = [
  "api.promaxcare.com.au",
  "app.promaxcare.com.au",
  "uat.promaxcare.com.au",
  "apitest.promaxcare.com.au",
];

/**
 * When EXPO_PUBLIC_CARE_OS_TEST=1, refuse production and hosted UAT.
 * The existing store profiles do not set that flag, so their addresses stay as they are.
 */
export function assertCareOsTestTarget(baseUrl: string, testMode: string | undefined): void {
  if (testMode !== "1") return;
  let host = "";
  try {
    host = new URL(baseUrl).host.toLowerCase();
  } catch {
    throw new Error("Care OS test mode needs an absolute test API address.");
  }
  const blocked = blockedHosts.some((item) => host === item || host.endsWith("." + item));
  if (blocked) {
    throw new Error("Care OS test mode refuses a production or hosted UAT address.");
  }
}
