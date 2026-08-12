import axiosInstance from "@/libs/axiosInstance";
import { ShiftRosterService } from "@/services/shift";

jest.mock("@/libs/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn().mockResolvedValue({ data: { status: "Success" } }),
  },
}));

const postedParams = () => {
  const [requestUrl] = (axiosInstance.post as jest.Mock).mock.calls.at(-1);
  const query = requestUrl.split("?")[1];
  return {
    path: requestUrl.split("?")[0],
    params: new URLSearchParams(query),
  };
};

describe("mobile attendance API contract", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends authenticated clock-in location, accuracy, medium and exception reason", async () => {
    await ShiftRosterService.clockIn("staff-7", 55, -33.86, 151.2, {
      accuracy: 8.5,
      exceptionReason: "Client requested support at hospital",
    });

    const request = postedParams();
    expect(request.path).toBe("/Attendances/clock_in");
    expect(Object.fromEntries(request.params.entries())).toEqual({
      userId: "staff-7",
      shiftId: "55",
      lat: "-33.86",
      lng: "151.2",
      medium: "Mobile",
      accuracy: "8.5",
      exceptionReason: "Client requested support at hospital",
    });
  });

  it("sends clock-out GPS instead of discarding it", async () => {
    await ShiftRosterService.clockOut("staff-7", 55, -33.861, 151.201, {
      accuracy: 11,
      exceptionReason: "Emergency department handover",
    });

    const request = postedParams();
    expect(request.path).toBe("/Attendances/clock_out");
    expect(Object.fromEntries(request.params.entries())).toEqual({
      userId: "staff-7",
      shiftId: "55",
      lat: "-33.861",
      lng: "151.201",
      medium: "Mobile",
      accuracy: "11",
      exceptionReason: "Emergency department handover",
    });
  });
});
