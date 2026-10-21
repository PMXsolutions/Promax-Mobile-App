import { documentNameForSubmit } from "@/libs/document-name";
import { displaySydneyDate } from "@/libs/display-date";
import { pathForNotificationData } from "@/libs/notification-route";
import { documentOwnedBySession, isOwnStaffRecord } from "@/libs/staff-record";
import { mileageSubmitDecision } from "@/libs/trip-mileage";

describe("trip mileage", () => {
  it("does not send a missing odometer or a zero start as mileage", () => {
    expect(mileageSubmitDecision("", "12").ok).toBe(false);
    expect(mileageSubmitDecision("0", "12").ok).toBe(false);
    expect(mileageSubmitDecision("40", "40").ok).toBe(false);
  });

  it("sends mileage only when the end reading is greater than the start", () => {
    expect(mileageSubmitDecision("120.5", "128")).toEqual({
      ok: true,
      startKm: 120.5,
      endKm: 128,
    });
  });
});

describe("documents and profile ownership", () => {
  it("requires a typed name when Others is selected", () => {
    expect(documentNameForSubmit("others", "  ").ok).toBe(false);
    expect(documentNameForSubmit("others", "Police check")).toEqual({
      ok: true,
      name: "Police check",
    });
    expect(documentNameForSubmit("Licence", "")).toEqual({
      ok: true,
      name: "Licence",
    });
  });

  it("denies a profile route that is not the signed-in staff id", () => {
    expect(isOwnStaffRecord("4", 4)).toBe(true);
    expect(isOwnStaffRecord("5", 4)).toBe(false);
    expect(isOwnStaffRecord("", 4)).toBe(false);
  });

  it("denies a document from another company or another user", () => {
    const session = { companyId: 9, staffId: 4, userId: "15" };
    expect(documentOwnedBySession({ companyId: 9, userId: 4 }, session)).toBe(
      true
    );
    expect(documentOwnedBySession({ companyId: 9, userId: 15 }, session)).toBe(
      true
    );
    expect(documentOwnedBySession({ companyId: 8, userId: 4 }, session)).toBe(
      false
    );
    expect(documentOwnedBySession({ companyId: 9, userId: 99 }, session)).toBe(
      false
    );
  });

  it("leaves a missing date blank instead of formatting an invalid date", () => {
    expect(displaySydneyDate(undefined)).toBe("");
    expect(displaySydneyDate("not-a-date")).toBe("");
  });
});

describe("notification taps", () => {
  it("opens a shift only when the payload has a shift id", () => {
    expect(pathForNotificationData({ shiftRosterId: 18 })).toBe(
      "/(root)/shift?id=18"
    );
    expect(pathForNotificationData({ body: "hello" })).toBe(
      "/(root)/notification"
    );
    expect(pathForNotificationData(undefined)).toBe("/(root)/notification");
  });
});
