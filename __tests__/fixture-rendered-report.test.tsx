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

const routeParams: { reportId?: string; rosterId?: string } = {
  reportId: "900001",
  rosterId: "900001",
};
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

import ReportScreen from "@/app/(root)/report";
import useAuthStore from "@/store/use-auth-store";
import {
  armReportDetailFailure,
  armReportSaveFailure,
  armRosterExpiry,
  armRosterFailure,
  fixtureCalls,
  holdNextReportDetail,
  holdNextReportSave,
  holdNextRoster,
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
const goalPlaceholder = "Provide details of goal progress and activities";

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
    renderer = TestRenderer.create(hosted(<ReportScreen />, queryClient));
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

function goalInput(root: ReactTestInstance) {
  const inputs = root.findAll(
    (node) =>
      node.props?.placeholder === goalPlaceholder &&
      node.type === "TextInput" &&
      typeof node.props?.onChangeText === "function"
  );
  if (inputs.length === 0) throw new Error("Expected the progress field");
  return inputs[0];
}

function fillGoal(root: ReactTestInstance, value: string) {
  act(() => {
    goalInput(root).props.onChangeText(value);
  });
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

describe("PromaxCare mobile fixture report access", () => {
  beforeEach(() => {
    resetFixtureBridge();
    routeParams.reportId = "900001";
    routeParams.rosterId = "900001";
    mockShowMessage.mockClear();
    signIn();
  });

  afterEach(async () => {
    await releaseMounted();
  });

  it("opens the assigned report and does not request another report", async () => {
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(goalInput(renderer.root).props.value).toBe("");
    expect(callsIncluding("/ShiftReports/get_shiftreport_details?id=900001").length).toBeGreaterThan(
      0
    );
    expect(callsIncluding("id=4")).toHaveLength(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
  });

  it("shows denial for an unlisted report and does not request it", async () => {
    routeParams.reportId = "4";
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBeGreaterThan(
      0
    );
    expect(callsIncluding("/ShiftRosters/get_shifts_by_user")).toHaveLength(1);
    expect(callsIncluding("/ShiftReports/get_shiftreport_details")).toHaveLength(0);
  });

  it("shows denial when the roster belongs to another company", async () => {
    signIn(4);
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBeGreaterThan(
      0
    );
    expect(textCount(renderer.root, "This report could not be loaded.")).toBe(0);
    expect(callsIncluding("/ShiftReports/get_shiftreport_details")).toHaveLength(0);
  });

  it("shows the loader while the roster is held", async () => {
    holdNextRoster();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "Loading Report..")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    expect(callsIncluding("/ShiftRosters/get_shifts_by_user")).toHaveLength(1);

    releaseReport();
    await flush();
    expect(goalInput(renderer.root)).toBeTruthy();
  });

  it("shows an error when the roster fails and opens the report on retry", async () => {
    armRosterFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "This report could not be loaded.")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    pressLabel(renderer.root, "Retry");
    await flush();

    expect(callsIncluding("/ShiftRosters/get_shifts_by_user")).toHaveLength(2);
    expect(goalInput(renderer.root).props.value).toBe("");
  });

  it("keeps one detail retry while that request is loading", async () => {
    armReportDetailFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "This report could not be loaded.")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    expect(callsIncluding("/ShiftReports/get_shiftreport_details")).toHaveLength(1);

    holdNextReportDetail();
    pressLabel(renderer.root, "Retry");
    await flush();
    expect(callsIncluding("/ShiftReports/get_shiftreport_details")).toHaveLength(2);
    expect(textCount(renderer.root, "Loading Report..")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Retry")).toBe(0);

    releaseReport();
    await flush();
    expect(goalInput(renderer.root).props.value).toBe("");
  });

  it("does not open a report when the sign-in has already ended", async () => {
    act(() => {
      useAuthStore.getState().logout();
    });
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(
      textCount(renderer.root, "Your sign-in has ended, so this report was not opened.")
    ).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    expect(fixtureCalls()).toHaveLength(0);
  });

  it("ends the sign-in when the roster answers 401", async () => {
    armRosterExpiry();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(
      textCount(renderer.root, "Your sign-in has ended, so this report was not opened.")
    ).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    expect(callsIncluding("/ShiftReports/get_shiftreport_details")).toHaveLength(0);
  });

  it("keeps the typed progress when the save fails and ignores the duplicate tap", async () => {
    const renderer = await mount(fixtureQueryClient());
    await flush();
    const progress = "a".repeat(100);
    fillGoal(renderer.root, progress);
    armReportSaveFailure();
    holdNextReportSave();
    pressLabel(renderer.root, "Submit");
    await flush();

    expect(callsIncluding("/ShiftReports/edit/900001")).toHaveLength(1);
    expect(goalInput(renderer.root).props.value).toBe(progress);
    expect(textCount(renderer.root, "Submit")).toBe(0);

    releaseReport();
    await flush();
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Could not save report",
      type: "danger",
    });
    expect(goalInput(renderer.root).props.value).toBe(progress);
  });

  it("keeps the typed progress after the sign-in ends and does not send it", async () => {
    const renderer = await mount(fixtureQueryClient());
    await flush();
    fillGoal(renderer.root, "kept-progress");
    await act(async () => {
      await useAuthStore.getState().logout();
    });
    await flush();

    expect(goalInput(renderer.root).props.value).toBe("kept-progress");
    expect(
      textCount(
        renderer.root,
        "Your sign-in has ended. The typed report is still on this screen and was not sent."
      )
    ).toBeGreaterThan(0);
    const editsBefore = callsIncluding("/ShiftReports/edit/").length;
    pressLabel(renderer.root, "Submit");
    await flush();
    expect(callsIncluding("/ShiftReports/edit/")).toHaveLength(editsBefore);
    expect(mockShowMessage).toHaveBeenCalledWith({
      message:
        "Your sign-in has ended. The typed report is still on this screen and was not sent.",
      type: "danger",
    });
    expect(goalInput(renderer.root).props.value).toBe("kept-progress");
  });
});
