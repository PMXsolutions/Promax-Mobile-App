import { assertCareOsTestTarget } from "../libs/careOsTestTarget";
import { applyCareOsUatIdentity } from "../libs/careOsUatIdentity";

describe("Care OS mobile test target", () => {
  it("leaves the existing production address alone when test mode is off", () => {
    expect(() => assertCareOsTestTarget("https://api.promaxcare.com.au/api", undefined)).not.toThrow();
  });

  it("refuses production and hosted UAT when test mode is on", () => {
    expect(() => assertCareOsTestTarget("https://api.promaxcare.com.au/api", "1")).toThrow(/refuses/);
    expect(() => assertCareOsTestTarget("https://apitest.promaxcare.com.au/api", "1")).toThrow(/refuses/);
    expect(() => assertCareOsTestTarget("https://uat.promaxcare.com.au", "1")).toThrow(/refuses/);
  });

  it("accepts a loopback test address when test mode is on", () => {
    expect(() => assertCareOsTestTarget("http://127.0.0.1:5080/api", "1")).not.toThrow();
  });

  it("keeps the store ids unless the UAT flag is set", () => {
    const store = {
      name: "Promax Care",
      ios: { bundleIdentifier: "com.promax-app" },
      android: { package: "com.tobby95.pmaxapp", googleServicesFile: "./google-services.json" },
    };
    expect(applyCareOsUatIdentity(store, undefined)).toBe(store);
    const uat = applyCareOsUatIdentity(store, "1");
    expect(uat.name).toBe("Promax Care (UAT)");
    expect(uat.ios.bundleIdentifier).toBe("com.promax-app.uat");
    expect(uat.android.package).toBe("com.tobby95.pmaxapp.uat");
    expect(uat.android.googleServicesFile).toBeUndefined();
    expect(store.android.package).toBe("com.tobby95.pmaxapp");
  });
});
