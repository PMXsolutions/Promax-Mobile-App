import {
  formattedTime,
  getActivityDetailStatus,
  shiftIncludesTransport,
} from "@/helpers/shift-service";
import { getShiftClients } from "@/helpers/shift-clients";
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

  it("keeps a timezone-less Sydney afternoon shift on that Sydney day", () => {
    const shift = buildShift({
      dateFrom: "2026-10-03T16:15:00" as unknown as Date,
      dateTo: "2026-10-03T17:18:00" as unknown as Date,
      attendance: false,
    });

    expect(formattedTime(shift.dateFrom, "d MMMM yyyy h:mm a")).toBe(
      "3 October 2026 4:15 PM"
    );
    expect(
      getActivityDetailStatus(shift, new Date("2026-10-03T06:17:00.000Z"))
    ).toBe("Clock-In");
    expect(
      getActivityDetailStatus(shift, new Date("2026-10-03T05:00:00.000Z"))
    ).toBe("Upcoming");
  });

  it("detects a transport activity with extra spacing", () => {
    expect(shiftIncludesTransport("Install phone, Transport")).toBe(true);
    expect(shiftIncludesTransport("Personal Support")).toBe(false);
  });
});

describe("getShiftClients", () => {
  it("splits a combined client string and keeps the matching client id", () => {
    const clients = getShiftClients({
      clients: "Ajeh Wumi Tao, Olatunji John",
      profile: {
        clientId: 42,
        profileId: 7,
        firstName: "Ajeh",
        middleName: "Wumi",
        surName: "Tao",
      },
    });

    expect(clients).toHaveLength(2);
    expect(clients[0]).toMatchObject({ name: "Ajeh Wumi Tao", clientId: 42 });
    expect(clients[1]).toMatchObject({
      name: "Olatunji John",
      clientId: undefined,
    });
  });
});
