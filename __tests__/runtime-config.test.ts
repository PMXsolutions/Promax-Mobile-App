import { validateRuntimeConfiguration } from "@/utils/runtime-config";

describe("mobile runtime environment isolation", () => {
  it("accepts the authorised UAT API shape", () => {
    expect(
      validateRuntimeConfiguration({
        environment: "uat",
        apiBaseUrl: "https://apitest.promaxcare.com.au/api/",
      })
    ).toEqual({
      environment: "uat",
      apiBaseUrl: "https://apitest.promaxcare.com.au/api",
    });
  });

  it("refuses a production build pointed at UAT", () => {
    expect(() =>
      validateRuntimeConfiguration({
        environment: "production",
        apiBaseUrl: "https://apitest.promaxcare.com.au/api",
      })
    ).toThrow("production mobile build");
  });

  it("refuses a UAT build pointed at a production-looking host", () => {
    expect(() =>
      validateRuntimeConfiguration({
        environment: "uat",
        apiBaseUrl: "https://api.promaxcare.com.au/api",
      })
    ).toThrow("UAT mobile build");
  });

  it("requires TLS and the API path outside local development", () => {
    expect(() =>
      validateRuntimeConfiguration({
        environment: "uat",
        apiBaseUrl: "http://apitest.promaxcare.com.au/api",
      })
    ).toThrow("HTTPS");
    expect(() =>
      validateRuntimeConfiguration({
        environment: "uat",
        apiBaseUrl: "https://apitest.promaxcare.com.au",
      })
    ).toThrow("/api suffix");
  });
});
