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

const routeParams: { rosterId?: string; reportId?: string } = {
  rosterId: "900001",
  reportId: "900001",
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

import ReportCreate from "@/app/(root)/report/create";
import ReportEdit from "@/app/(root)/report/index";
import useAuthStore from "@/store/use-auth-store";
import { resetDraftKeyMemoryForTests } from "@/libs/report-draft-store";
import { __resetMemorySecureStore } from "@/test-support/memory-secure-store";
import {
  armRosterFailure,
  fixtureCalls,
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
let screen: "create" | "edit" = "create";

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
  const node = screen === "create" ? <ReportCreate /> : <ReportEdit />;
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
    for (let step = 0; step < 20; step += 1) await Promise.resolve();
  });
}

async function settleDraft() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  await flush();
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

function signIn(companyId = 900001, staffId = 900001) {
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
        staffId,
        firstName: "Fixture",
        imageUrl: "",
      } as never,
    });
  });
}

async function resetDraftStorage() {
  __resetMemorySecureStore();
  resetDraftKeyMemoryForTests();
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  const keys = await AsyncStorage.getAllKeys();
  if (keys.length > 0) await AsyncStorage.multiRemove(keys);
}

describe("PromaxCare mobile fixture protected report draft", () => {
  beforeEach(async () => {
    resetFixtureBridge();
    routeParams.rosterId = "900001";
    routeParams.reportId = "900001";
    screen = "create";
    mockShowMessage.mockClear();
    await resetDraftStorage();
    signIn();
  });

  afterEach(async () => {
    await releaseMounted();
  });

  it("shows a roster load error and opens the add form on retry", async () => {
    armRosterFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(renderer.root, "This report could not be loaded.")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "This shift is not assigned to your sign-in.")).toBe(0);
    pressLabel(renderer.root, "Retry");
    await flush();
    expect(goalInput(renderer.root).props.value ?? "").toBe("");
    expect(callsIncluding("/ShiftReports/add_shiftreport")).toHaveLength(0);
  });

  it("restores the typed add-report text after the screen closes", async () => {
    const progress = "kept-progress";
    const first = await mount(fixtureQueryClient());
    await flush();
    act(() => {
      goalInput(first.root).props.onChangeText(progress);
    });
    await settleDraft();
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      expect(String((await AsyncStorage.getItem(key)) ?? "")).not.toContain(progress);
    }
    await releaseMounted();
    const second = await mount(fixtureQueryClient());
    await flush();
    expect(goalInput(second.root).props.value).toBe(progress);
    expect(callsIncluding("/ShiftReports/add_shiftreport")).toHaveLength(0);
  });

  it("keeps the add-report draft after sign-out and does not send it", async () => {
    const progress = "kept-progress";
    const first = await mount(fixtureQueryClient());
    await flush();
    act(() => {
      goalInput(first.root).props.onChangeText(progress);
    });
    await settleDraft();
    await releaseMounted();
    await act(async () => {
      await useAuthStore.getState().logout();
    });
    const callsBeforeClosed = fixtureCalls().length;
    const closed = await mount(fixtureQueryClient());
    await flush();
    expect(
      textCount(closed.root, "Your sign-in has ended, so this report was not opened.")
    ).toBeGreaterThan(0);
    expect(fixtureCalls()).toHaveLength(callsBeforeClosed);
    await releaseMounted();
    signIn();
    const restored = await mount(fixtureQueryClient());
    await flush();
    expect(goalInput(restored.root).props.value).toBe(progress);
    await act(async () => {
      await useAuthStore.getState().logout();
    });
    await flush();
    pressLabel(restored.root, "Submit");
    await flush();
    expect(callsIncluding("/ShiftReports/add_shiftreport")).toHaveLength(0);
    expect(goalInput(restored.root).props.value).toBe(progress);
  });

  it("does not show another company's add-report draft", async () => {
    const progress = "kept-progress";
    const first = await mount(fixtureQueryClient());
    await flush();
    act(() => {
      goalInput(first.root).props.onChangeText(progress);
    });
    await settleDraft();
    await releaseMounted();
    signIn(4);
    const other = await mount(fixtureQueryClient());
    await flush();
    expect(textCount(other.root, "This shift is not assigned to your sign-in.")).toBeGreaterThan(
      0
    );
    expect(textCount(other.root, progress)).toBe(0);
    expect(callsIncluding("/ShiftReports/add_shiftreport")).toHaveLength(0);
  });

  it("restores the typed edit-report text after the screen closes", async () => {
    screen = "edit";
    const progress = "kept-edit";
    const first = await mount(fixtureQueryClient());
    await flush();
    act(() => {
      goalInput(first.root).props.onChangeText(progress);
    });
    await settleDraft();
    await releaseMounted();
    const second = await mount(fixtureQueryClient());
    await flush();
    expect(goalInput(second.root).props.value).toBe(progress);
    expect(callsIncluding("/ShiftReports/edit/")).toHaveLength(0);
  });
});
