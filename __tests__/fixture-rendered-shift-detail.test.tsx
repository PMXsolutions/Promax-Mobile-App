import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { notifyManager } from "@tanstack/query-core";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

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

jest.mock("lottie-react-native", () => {
  const ReactActual = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => ReactActual.createElement(View, null),
  };
});

jest.mock("react-native-maps", () => {
  const ReactActual = require("react");
  const { View } = require("react-native");
  const MapView = ({ children }: { children?: React.ReactNode }) =>
    ReactActual.createElement(View, null, children);
  return {
    __esModule: true,
    default: MapView,
    Marker: View,
    Circle: View,
  };
});

jest.mock("@gorhom/bottom-sheet", () => {
  const ReactActual = require("react");
  const { View } = require("react-native");
  return {
    BottomSheetModal: ReactActual.forwardRef(
      (
        { children }: { children?: React.ReactNode },
        _ref: React.Ref<unknown>
      ) => ReactActual.createElement(View, null, children)
    ),
    BottomSheetView: ({ children }: { children?: React.ReactNode }) =>
      ReactActual.createElement(View, null, children),
  };
});

const routeParams: { id?: string; clients?: string } = { id: "900001" };
const mockShowMessage = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => routeParams,
  router: {
    back: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  },
  Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

jest.mock("react-native-flash-message", () => ({
  showMessage: (...args: unknown[]) => mockShowMessage(...args),
}));

import ShiftDetail from "@/app/(root)/shift/index";
import useAuthStore from "@/store/use-auth-store";
import {
  armRosterExpiry,
  armRosterFailure,
  armShiftDetailFailure,
  armShiftDetailMismatch,
  fixtureCalls,
  holdNextRoster,
  holdNextShiftDetail,
  releaseReport,
  resetFixtureBridge,
} from "@/test-support/fixture-axios";

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

function hosted(node: React.ReactElement, queryClient: QueryClient) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
        frame: { x: 0, y: 0, width: 390, height: 844 },
      }}
    >
      <NavigationContainer theme={DefaultTheme}>
        <QueryClientProvider client={queryClient}>{node}</QueryClientProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

async function mount(queryClient: QueryClient) {
  let renderer: ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(hosted(<ShiftDetail />, queryClient));
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
  const labels = root.findAll(
    (node) =>
      node.props?.children === label || node.props?.accessibilityLabel === label
  );
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

function textCount(root: ReactTestInstance, value: string) {
  return root.findAll((node) => node.props?.children === value).length;
}

function callsIncluding(fragment: string) {
  return fixtureCalls().filter((call) => call.path.includes(fragment));
}

function signIn(companyId = 900001) {
  act(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: "fixture-token",
      user: {
        userId: "fixture-user",
        companyId,
        role: "Staff",
      } as never,
      staff: {
        staffId: 900001,
        firstName: "Fixture",
        imageUrl: "",
      } as never,
    });
  });
}

describe("PromaxCare mobile fixture shift detail", () => {
  beforeEach(() => {
    resetFixtureBridge();
    routeParams.id = "900001";
    mockShowMessage.mockClear();
    signIn();
  });

  afterEach(async () => {
    await releaseMounted();
  });

  it("opens the assigned shift and does not clock in", async () => {
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "9:00 AM")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Personal care")).toBeGreaterThan(0);
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(1);
    expect(callsIncluding("/ShiftRosters/4")).toHaveLength(0);
    expect(callsIncluding("/Attendances/clock_in")).toHaveLength(0);
  });

  it("shows denial for an unlisted shift and does not request that shift", async () => {
    routeParams.id = "4";
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBeGreaterThan(
      0
    );
    expect(textCount(renderer.root, "This shift could not be loaded.")).toBe(0);
    expect(callsIncluding("/ShiftRosters/4")).toHaveLength(0);
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(0);
    expect(callsIncluding("/Attendances/clock_in")).toHaveLength(0);
  });

  it("shows denial when the roster belongs to another company", async () => {
    signIn(4);
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBeGreaterThan(
      0
    );
    expect(textCount(renderer.root, "This shift could not be loaded.")).toBe(0);
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(0);
    expect(callsIncluding("/Attendances/clock_in")).toHaveLength(0);
  });

  it("shows an error when the roster fails and opens the shift on retry", async () => {
    armRosterFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "This shift could not be loaded.")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(0);
    pressLabel(renderer.root, "Retry");
    await flush();
    expect(callsIncluding("/ShiftRosters/get_shifts_by_user")).toHaveLength(2);
    expect(textCount(renderer.root, "9:00 AM")).toBeGreaterThan(0);
  });

  it("shows the loader while the roster is held", async () => {
    holdNextRoster();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "Loading Shift..")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    releaseReport();
    await flush();
    expect(textCount(renderer.root, "9:00 AM")).toBeGreaterThan(0);
  });

  it("shows an error when the shift detail fails and opens it on retry", async () => {
    armShiftDetailFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "This shift could not be loaded.")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(1);
    holdNextShiftDetail();
    pressLabel(renderer.root, "Retry");
    await flush();
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(2);
    expect(textCount(renderer.root, "Loading Shift..")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Retry")).toBe(0);
    releaseReport();
    await flush();
    expect(textCount(renderer.root, "9:00 AM")).toBeGreaterThan(0);
    expect(callsIncluding("/Attendances/clock_in")).toHaveLength(0);
  });

  it("shows denial when the shift detail belongs to another company", async () => {
    armShiftDetailMismatch();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBeGreaterThan(
      0
    );
    expect(textCount(renderer.root, "This shift could not be loaded.")).toBe(0);
    expect(textCount(renderer.root, "9:00 AM")).toBe(0);
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(1);
    expect(callsIncluding("/Attendances/clock_in")).toHaveLength(0);
  });

  it("does not open a shift when the sign-in has already ended", async () => {
    act(() => {
      useAuthStore.getState().logout();
    });
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(
      textCount(renderer.root, "Your sign-in has ended, so this shift was not opened.")
    ).toBeGreaterThan(0);
    expect(fixtureCalls()).toHaveLength(0);
  });

  it("ends the sign-in when the roster answers 401", async () => {
    armRosterExpiry();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(
      textCount(renderer.root, "Your sign-in has ended, so this shift was not opened.")
    ).toBeGreaterThan(0);
    expect(callsIncluding("/ShiftRosters/900001")).toHaveLength(0);
    expect(callsIncluding("/Attendances/clock_in")).toHaveLength(0);
  });
});
