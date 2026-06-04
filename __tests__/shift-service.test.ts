import { getActivityDetailStatus } from "@/helpers/shift-service";
import { ShiftRosterType } from "@/types/shift";

const buildShift = (overrides: Partial<ShiftRosterType>): ShiftRosterType =>
  ({
    shiftRosterId: 1,
    staffId: 1,
    reportId: 1,
    dateFrom: new Date("2026-06-03T10:00:00+10:00"),
    dateTo: new Date("2026-06-03T12:00:00+10:00"),
    status: "Confirmed",
    attendance: false,
    isEnded: false,
    isShiftReportSigned: false,
    ...overrides,
  } as ShiftRosterType);

describe("getActivityDetailStatus", () => {
  it("marks an ended unattended Date-object shift as absent", () => {
    const status = getActivityDetailStatus(
      buildShift({
        dateFrom: new Date("2026-06-03T10:00:00+10:00"),
        dateTo: new Date("2026-06-03T12:00:00+10:00"),
        attendance: false,
      }),
      new Date("2026-06-03T13:00:00+10:00")
    );

    expect(status).toBe("Absent");
  });

  it("opens the clock-in window ten minutes before the Sydney roster time", () => {
    const status = getActivityDetailStatus(
      buildShift({
        dateFrom: new Date("2026-06-03T10:00:00+10:00"),
        dateTo: new Date("2026-06-03T12:00:00+10:00"),
      }),
      new Date("2026-06-03T09:55:00+10:00")
    );

    expect(status).toBe("Clock-In");
  });

  it("keeps cancelled shifts cancelled regardless of future start time", () => {
    const status = getActivityDetailStatus(
      buildShift({
        status: "Cancelled",
        dateFrom: new Date("2026-06-03T10:00:00+10:00"),
        dateTo: new Date("2026-06-03T12:00:00+10:00"),
      }),
      new Date("2026-06-03T08:00:00+10:00")
    );

    expect(status).toBe("Cancelled");
  });

  it("keeps overnight sleepover shifts clock-in eligible before next-day end time", () => {
    const status = getActivityDetailStatus(
      buildShift({
        dateFrom: new Date("2026-06-03T22:00:00+10:00"),
        dateTo: new Date("2026-06-03T06:00:00+10:00"),
        isNightShift: true,
        attendance: false,
      }),
      new Date("2026-06-03T23:00:00+10:00")
    );

    expect(status).toBe("Clock-In");
  });

  it("marks overnight shifts absent only after the rolled-over end time", () => {
    const status = getActivityDetailStatus(
      buildShift({
        dateFrom: new Date("2026-06-03T22:00:00+10:00"),
        dateTo: new Date("2026-06-03T06:00:00+10:00"),
        isNightShift: true,
        attendance: false,
      }),
      new Date("2026-06-04T07:00:00+10:00")
    );

    expect(status).toBe("Absent");
  });
});
