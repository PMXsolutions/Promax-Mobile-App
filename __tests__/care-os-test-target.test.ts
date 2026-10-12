import { assertCareOsTestTarget } from "../libs/careOsTestTarget";

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
});
