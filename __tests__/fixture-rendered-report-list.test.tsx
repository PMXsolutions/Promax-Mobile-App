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

jest.mock("@shopify/flash-list", () => {
  const ReactActual = require("react");
  const { View } = require("react-native");
  return {
    FlashList: ({
      data,
      renderItem,
      ListEmptyComponent,
    }: {
      data?: { shiftReportId?: number }[];
      renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
      ListEmptyComponent?: React.ReactNode | (() => React.ReactNode);
    }) => {
      const empty =
        typeof ListEmptyComponent === "function"
          ? ListEmptyComponent()
          : ListEmptyComponent;
      const rows =
        data && data.length > 0
          ? data.map((item, index) =>
              ReactActual.createElement(
                View,
                { key: String(item.shiftReportId ?? index) },
                renderItem?.({ item, index })
              )
            )
          : empty;
      return ReactActual.createElement(View, null, rows);
    },
  };
});

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({}),
  router: {
    back: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  },
  Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

import ReportList from "@/app/(root)/(tabs)/reports";
import useAuthStore from "@/store/use-auth-store";
import {
  armEmptyStaffReports,
  armStaffReportListFailure,
  fixtureCalls,
  holdNextStaffReports,
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
    renderer = TestRenderer.create(hosted(<ReportList />, queryClient));
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
    for (let step = 0; step < 20; step += 1) await Promise.resolve();
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

function reportListGets() {
  return fixtureCalls().filter((call) =>
    call.path.includes("/ShiftReports/get_staff_shiftreports")
  );
}

function signIn() {
  act(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: "fixture-token",
      user: {
        userId: "fixture-user",
        companyId: 900001,
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

describe("PromaxCare mobile fixture shift-report list", () => {
  beforeEach(() => {
    resetFixtureBridge();
    signIn();
  });

  afterEach(async () => {
    await releaseMounted();
  });

  it("shows a load error without the empty sentence", async () => {
    armStaffReportListFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "Unable to load shift reports.")).toBeGreaterThan(
      0
    );
    expect(textCount(renderer.root, "No data available")).toBe(0);
    expect(textCount(renderer.root, "Fixture client")).toBe(0);
    expect(reportListGets()).toHaveLength(1);
  });

  it("shows the loader while the shift-report list is held", async () => {
    holdNextStaffReports();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "Loading...")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "No data available")).toBe(0);
    expect(textCount(renderer.root, "Unable to load shift reports.")).toBe(0);
    releaseReport();
    await flush();
    expect(textCount(renderer.root, "Fixture client")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Unable to load shift reports.")).toBe(0);
    expect(textCount(renderer.root, "Loading...")).toBe(0);
    expect(textCount(renderer.root, "No data available")).toBe(0);
  });

  it("shows the empty sentence after an empty shift-report list", async () => {
    armEmptyStaffReports();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "No data available")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Unable to load shift reports.")).toBe(0);
    expect(textCount(renderer.root, "Loading...")).toBe(0);
    expect(textCount(renderer.root, "Fixture client")).toBe(0);
  });

  it("retries a failed shift-report list without leaving the empty sentence up", async () => {
    armStaffReportListFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "No data available")).toBe(0);
    holdNextStaffReports();
    pressLabel(renderer.root, "Retry");
    await flush();
    expect(reportListGets()).toHaveLength(2);
    expect(textCount(renderer.root, "Loading...")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Retry")).toBe(0);
    expect(textCount(renderer.root, "No data available")).toBe(0);
    releaseReport();
    await flush();
    expect(textCount(renderer.root, "Unable to load shift reports.")).toBe(0);
    expect(textCount(renderer.root, "Fixture client")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Loading...")).toBe(0);
    expect(textCount(renderer.root, "No data available")).toBe(0);
  });
});
