import {
  FIXTURE_BASE_URL,
  FIXTURE_SESSION,
  PRODUCTION_API_HOST,
  createIsolatedFixture,
  isEmailUnconfirmedMessage,
  isolatedBaseUrlDecision,
} from "@/libs/isolated-fixture";

function fixture() {
  return createIsolatedFixture();
}

describe("PromaxCare mobile isolated fixture", () => {
  it("refuses an empty base URL and the production host", () => {
    expect(isolatedBaseUrlDecision("")).toEqual({ ok: false, reason: "empty" });
    expect(isolatedBaseUrlDecision("   ")).toEqual({ ok: false, reason: "empty" });
    expect(isolatedBaseUrlDecision("https://api.promaxcare.com.au/api")).toEqual({
      ok: false,
      reason: "production",
    });
    expect(isolatedBaseUrlDecision("https://API.promaxcare.com.au/api")).toEqual({
      ok: false,
      reason: "production",
    });
    expect(isolatedBaseUrlDecision(FIXTURE_BASE_URL)).toMatchObject({ ok: true });
    expect(PRODUCTION_API_HOST).toBe("api.promaxcare.com.au");
  });

  it("classifies the unconfirmed-email sentence before a generic 401", () => {
    const api = fixture();
    const unconfirmed = api.respond({
      method: "POST",
      path: "/Account/auth_login?medium=Mobile",
      body: { email: FIXTURE_SESSION.email, password: "unconfirmed" },
    });
    expect(unconfirmed.status).toBe(401);
    expect(isEmailUnconfirmedMessage(String((unconfirmed.body as { message: string }).message))).toBe(
      true
    );

    const generic = api.respond({
      method: "POST",
      path: "/Account/auth_login?medium=Mobile",
      body: { password: "wrong" },
    });
    expect(generic.status).toBe(401);
    expect(isEmailUnconfirmedMessage(String((generic.body as { message: string }).message))).toBe(
      false
    );

    const mail = api.respond({
      method: "POST",
      path: "/Account/auth_login?medium=Mobile",
      body: { password: "mail-limit" },
    });
    expect(isEmailUnconfirmedMessage(String((mail.body as { message: string }).message))).toBe(
      false
    );
    expect(isEmailUnconfirmedMessage("email not confirmed. Check the inbox.")).toBe(true);
  });

  it("signs in the fictional staff member and does not send mail", () => {
    const api = fixture();
    const signedIn = api.respond({
      method: "POST",
      path: "/Account/auth_login?medium=Mobile",
      body: { password: "fixture" },
    });
    expect(signedIn).toMatchObject({
      status: 200,
      body: {
        userId: "fixture-user",
        staffId: 900001,
        companyId: 900001,
        email: "fixture.staff@example.invalid",
      },
    });
    expect(
      api.respond({ method: "GET", path: "/Account/forgot_password?email=fixture.staff@example.invalid" })
    ).toEqual({ status: 200, body: { mailed: false } });
    expect(api.respond({ method: "POST", path: "/Account/reset_password", body: {} }).body).toMatchObject({
      mailed: false,
    });
  });

  it("returns the fictional roster and rejects another staff id", () => {
    const api = fixture();
    expect(
      api.respond({
        method: "GET",
        path: "/ShiftRosters/get_shifts_by_user?client=&staff=900001",
      }).status
    ).toBe(200);
    expect(
      api.respond({
        method: "GET",
        path: "/ShiftRosters/get_shifts_by_user?client=&staff=4",
      }).status
    ).toBe(403);
    expect(api.respond({ method: "GET", path: "/ShiftRosters/900001" }).status).toBe(200);
    expect(api.respond({ method: "GET", path: "/ShiftRosters/4" }).status).toBe(403);
  });

  it("clocks in once on GET and stores nothing while offline", () => {
    const api = fixture();
    const path = "/Attendances/clock_in?userId=fixture-user&shiftId=900001&lat=1&lng=2";
    expect(api.respond({ method: "GET", path }).status).toBe(200);
    expect(api.respond({ method: "GET", path }).status).toBe(409);
    const before = api.snapshot().clocked;
    const offline = api.respond({ method: "GET", path, offline: true });
    expect(offline).toEqual({ status: 0, body: { kind: "unavailable", stored: false } });
    expect(api.snapshot().clocked).toBe(before);
    expect(
      api.respond({
        method: "GET",
        path: "/Attendances/clock_out?userId=other-user&shiftId=900001",
      }).status
    ).toBe(403);
  });

  it("accepts a greater odometer and refuses a zero start", () => {
    const api = fixture();
    expect(
      api.respond({
        method: "GET",
        path: "/ShiftRosters/fill_mileage?shiftId=900001&startKm=10&endKm=12",
      }).status
    ).toBe(200);
    const refused = api.respond({
      method: "GET",
      path: "/ShiftRosters/fill_mileage?shiftId=900001&startKm=0&endKm=12",
    });
    expect(refused.status).toBe(422);
    expect((refused.body as { stored: boolean }).stored).toBe(false);
  });

  it("keeps a failed other-info save off the stored profile", () => {
    const api = fixture();
    const failed = api.respond({
      method: "POST",
      path: "/Staffs/edit/900001?userId=fixture-user",
      body: { instagram: "kept-handle", fail: true },
    });
    expect(failed.status).toBe(500);
    expect(api.snapshot().instagram).toBe("fixture-handle");
    const saved = api.respond({
      method: "POST",
      path: "/Staffs/edit/900001?userId=fixture-user",
      body: { instagram: "next-handle" },
    });
    expect(saved.status).toBe(200);
    expect(api.respond({ method: "GET", path: "/Staffs/900001" }).body).toMatchObject({
      instagram: "next-handle",
    });
  });

  it("stores one Android FCM token and refuses an iOS post", () => {
    const api = fixture();
    const ios = api.respond({
      method: "POST",
      path: "/DeviceTokens/add_token",
      platform: "ios",
      deviceType: "ios",
      body: { Device_Token: "apns-token", UserId: "fixture-user", CompanyId: 900001 },
    });
    expect(ios).toEqual({ status: 403, body: { stored: false } });
    expect(api.snapshot().tokens).toEqual([]);

    const unmarked = api.respond({
      method: "POST",
      path: "/DeviceTokens/add_token",
      body: { Device_Token: "apns-token", UserId: "fixture-user", CompanyId: 900001 },
    });
    expect(unmarked.status).toBe(403);

    const android = api.respond({
      method: "POST",
      path: "/DeviceTokens/add_token",
      platform: "android",
      deviceType: "android",
      body: { Device_Token: "fcm-token", UserId: "fixture-user", CompanyId: 900001 },
    });
    expect(android).toEqual({ status: 200, body: { stored: true } });
    expect(api.snapshot().tokens).toEqual(["fcm-token"]);

    const otherCompany = api.respond({
      method: "POST",
      path: "/DeviceTokens/add_token",
      platform: "android",
      deviceType: "android",
      body: { Device_Token: "fcm-token", UserId: "fixture-user", CompanyId: 4 },
    });
    expect(otherCompany.status).toBe(403);
  });

  it("rejects a second report save and leaves blocked workflows absent", () => {
    const api = fixture();
    const path = "/ShiftReports/add_shiftreport?userId=fixture-user";
    expect(api.respond({ method: "POST", path, body: {} }).status).toBe(200);
    expect(api.respond({ method: "POST", path, body: {} }).status).toBe(409);
    expect(api.respond({ method: "POST", path: "/PBS/sima_summary", body: {} })).toEqual({
      status: 404,
      body: { kind: "absent", stored: false },
    });
    expect(
      api.respond({ method: "GET", path: "/StaffAttendances/get_all_staff_attendances" }).status
    ).toBe(404);
    expect(api.respond({ method: "POST", path: "/ProgressNotes/add", body: {} }).status).toBe(404);
  });

  it("returns the fictional document, company, and inbox only for the fixture ids", () => {
    const api = fixture();
    expect(
      api.respond({ method: "GET", path: "/Documents/get_all_staff_documents?staffId=900001" })
        .status
    ).toBe(200);
    expect(
      api.respond({ method: "GET", path: "/Documents/get_all_staff_documents?staffId=4" }).status
    ).toBe(403);
    expect(
      api.respond({ method: "GET", path: "/Companies/get_company/900001" }).body
    ).toEqual({ company: { companyId: 900001 } });
    expect(api.respond({ method: "GET", path: "/Companies/get_company/4" }).status).toBe(403);
    expect(
      api.respond({ method: "GET", path: "/Messages/inbox?userId=fixture-user" }).status
    ).toBe(200);
    expect(api.respond({ method: "GET", path: "/Messages/inbox?userId=other" }).status).toBe(403);
    expect(
      api.respond({
        method: "POST",
        path: "/StaffAvailibilities/add_staff_availability?userId=fixture-user",
        body: { staffId: 4, companyID: 900001 },
      }).status
    ).toBe(403);
  });
});
