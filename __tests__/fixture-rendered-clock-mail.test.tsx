import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { notifyManager } from "@tanstack/query-core";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

notifyManager.setScheduler((callback) => {
  callback();
});

jest.mock("@/libs/axiosInstance", () => {
  const bridge = require("@/test-support/fixture-axios");
  return {
    __esModule: true,
    default: bridge.axiosInstance,
    publicAxios: bridge.publicAxios,
  };
});

jest.mock("@/utils/storage", () => {
  const memory = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      setItem: async (key: string, value: string) => {
        memory.set(key, value);
      },
      getItem: async (key: string) => memory.get(key) ?? null,
      removeItem: async (key: string) => {
        memory.delete(key);
      },
    },
  };
});

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();
const mockShowMessage = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    replace: jest.fn(),
    back: jest.fn(),
    push: (...args: unknown[]) => mockPush(...args),
  },
  Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

jest.mock("react-native-flash-message", () => ({
  showMessage: (...args: unknown[]) => mockShowMessage(...args),
}));

jest.mock("@/components/shared/checkbox", () => {
  const ReactActual = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ label }: { label?: string }) =>
      ReactActual.createElement(Text, null, label ?? ""),
  };
});

import * as Location from "expo-location";
import SignInForm from "@/modules/auth/sign-in-form";
import ShiftAction from "@/helpers/shift-action";
import useClockIn from "@/hooks/queries/shift/clock-in";
import { useClockOut } from "@/hooks/queries/shift/clock-out";
import useAuthStore from "@/store/use-auth-store";
import { fixtureCalls, resetFixtureBridge } from "@/test-support/fixture-axios";
import { ShiftRosterType } from "@/types/shift";

function loadRenderer(): typeof import("react-test-renderer") {
  const nested = "jest-expo/node_modules/react-test-renderer";
  try {
    const version = require(`${nested}/package.json`).version as string;
    if (version.startsWith("19.")) return require(nested);
  } catch {
    // A flat install exposes the matching renderer at the package name.
  }
  return require("react-test-renderer");
}

const TestRenderer = loadRenderer();
const { act } = TestRenderer;
type ReactTestInstance = import("react-test-renderer").ReactTestInstance;
type ReactTestRenderer = import("react-test-renderer").ReactTestRenderer;

const CLIENT_LAT = -33.8688;
const CLIENT_LNG = 151.2093;
const MAIL_LIMIT =
  "Error sending mail. Too many mails sent. Retry in One hour time.";

const openClients: QueryClient[] = [];
let openRenderer: ReactTestRenderer | null = null;

function fixtureQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  openClients.push(queryClient);
  return queryClient;
}

function hosted(node: React.ReactElement, queryClient?: QueryClient) {
  const body = queryClient ? (
    <QueryClientProvider client={queryClient}>{node}</QueryClientProvider>
  ) : (
    node
  );
  return (
    <NavigationContainer theme={DefaultTheme}>{body}</NavigationContainer>
  );
}

async function mount(node: React.ReactElement, queryClient?: QueryClient) {
  let renderer: ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(hosted(node, queryClient));
  });
  openRenderer = renderer!;
  return renderer!;
}

async function releaseMounted() {
  const renderer = openRenderer;
  openRenderer = null;
  if (renderer) {
    await act(async () => {
      renderer.unmount();
    });
  }
  for (const queryClient of openClients.splice(0)) {
    queryClient.getQueryCache().getAll().forEach((query) => query.destroy());
    queryClient
      .getMutationCache()
      .getAll()
      .forEach((mutation) => mutation.destroy());
    queryClient.clear();
  }
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

function pressLabel(root: ReactTestInstance, label: string) {
  const labels = root.findAll((node) => node.props?.children === label);
  for (const labelNode of labels) {
    let current: ReactTestInstance | null = labelNode;
    while (current) {
      if (typeof current.props?.onPress === "function") {
        act(() => {
          current?.props.onPress();
        });
        return;
      }
      current = current.parent;
    }
  }
  throw new Error(`No press handler for ${label}`);
}

function fillPlaceholder(root: ReactTestInstance, placeholder: string, value: string) {
  const inputs = root.findAll(
    (node) =>
      node.props?.placeholder === placeholder &&
      typeof node.props?.onChangeText === "function" &&
      node.type === "TextInput"
  );
  if (inputs.length === 0) {
    throw new Error(`Expected a ${placeholder} field`);
  }
  act(() => {
    inputs[0].props.onChangeText(value);
  });
}

function shiftDuring(now: Date, extra: Partial<ShiftRosterType>): ShiftRosterType {
  return {
    shiftRosterId: 900001,
    status: "Confirmed",
    dateFrom: "2026-10-31T09:00:00",
    dateTo: "2026-10-31T17:00:00",
    attendance: null,
    isEnded: false,
    isShiftReportSigned: false,
    ...extra,
  } as ShiftRosterType;
}

function ClockInScreen({ now }: { now: Date }) {
  const clock = useClockIn("fixture-user", 900001, CLIENT_LAT, CLIENT_LNG);
  return (
    <ShiftAction
      activity={shiftDuring(now, {})}
      now={now}
      clockIn={clock.handleClock}
      clockInPending={clock.clockInPending}
      clockOut={() => undefined}
      clockOutPending={false}
    />
  );
}

function ClockOutScreen({
  now,
  userId,
}: {
  now: Date;
  userId: string;
}) {
  const clockOut = useClockOut(userId, 900001);
  return (
    <ShiftAction
      activity={shiftDuring(now, {
        attendance: { attendanceId: 1 } as ShiftRosterType["attendance"],
        isEnded: false,
        isShiftReportSigned: true,
      })}
      now={now}
      clockIn={async () => undefined}
      clockInPending={false}
      clockOut={clockOut.mutate}
      clockOutPending={clockOut.isPending}
    />
  );
}

describe("PromaxCare mobile fixture clock and mail screens", () => {
  const now = new Date("2026-10-31T12:00:00");

  beforeEach(() => {
    resetFixtureBridge();
    mockNavigate.mockClear();
    mockPush.mockClear();
    mockShowMessage.mockClear();
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: CLIENT_LAT, longitude: CLIENT_LNG },
    });
    act(() => {
      useAuthStore.setState({
        isAuthenticated: false,
        token: null,
        user: null,
        staff: null,
      });
    });
  });

  afterEach(async () => {
    await releaseMounted();
  });

  it("keeps a mail-limit sign-in off the code screen", async () => {
    const renderer = await mount(<SignInForm />);
    fillPlaceholder(renderer.root, "Enter your email", "fixture.staff@example.invalid");
    fillPlaceholder(renderer.root, "Enter your password", "mail-limit");
    pressLabel(renderer.root, "Sign In");
    await flush();

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: MAIL_LIMIT,
      type: "danger",
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(
      fixtureCalls().some((call) => call.path.startsWith("/Account/auth_login"))
    ).toBe(true);
  });

  it("does not clock in when location permission is denied", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });
    const queryClient = fixtureQueryClient();
    const renderer = await mount(<ClockInScreen now={now} />, queryClient);
    pressLabel(renderer.root, "Clock In");
    await flush();

    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Location Access Denied",
      description:
        "We need location access to clock you in. Please enable it in settings.",
      type: "danger",
    });
    expect(
      fixtureCalls().some((call) => call.path.includes("/Attendances/clock_in"))
    ).toBe(false);
  });

  it("clocks the fixture shift in once and keeps the second tap off a stored clock-in", async () => {
    const queryClient = fixtureQueryClient();
    const renderer = await mount(<ClockInScreen now={now} />, queryClient);
    pressLabel(renderer.root, "Clock In");
    await flush();

    const clockIns = () =>
      fixtureCalls().filter((call) => call.path.includes("/Attendances/clock_in"));
    expect(clockIns()).toHaveLength(1);
    expect(clockIns()[0].method).toBe("GET");
    expect(clockIns()[0].path).toContain("userId=fixture-user");
    expect(clockIns()[0].path).toContain("shiftId=900001");
    expect(clockIns()[0].path).toContain(`lat=${CLIENT_LAT}`);
    expect(clockIns()[0].path).toContain(`lng=${CLIENT_LNG}`);

    pressLabel(renderer.root, "Clock In");
    await flush();

    expect(clockIns()).toHaveLength(2);
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "An error occurred",
      description: undefined,
      type: "danger",
    });
  });

  it("clocks out on GET and refuses a different user", async () => {
    const queryClient = fixtureQueryClient();
    const renderer = await mount(
      <ClockOutScreen now={now} userId="fixture-user" />,
      queryClient
    );
    pressLabel(renderer.root, "Clock Out");
    await flush();

    expect(
      fixtureCalls().some(
        (call) =>
          call.method === "GET" &&
          call.path ===
            "/Attendances/clock_out?userId=fixture-user&shiftId=900001"
      )
    ).toBe(true);
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: undefined,
      description: "Well done!",
      type: "success",
    });

    await releaseMounted();
    mockShowMessage.mockClear();
    const deniedClient = fixtureQueryClient();
    const denied = await mount(
      <ClockOutScreen now={now} userId="other-user" />,
      deniedClient
    );
    pressLabel(denied.root, "Clock Out");
    await flush();

    expect(
      fixtureCalls().some(
        (call) =>
          call.method === "GET" &&
          call.path ===
            "/Attendances/clock_out?userId=other-user&shiftId=900001"
      )
    ).toBe(true);
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "An error occurred",
      description: undefined,
      type: "danger",
    });
  });
});
