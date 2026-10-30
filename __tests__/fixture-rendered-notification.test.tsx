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

jest.mock("react-native-webview", () => {
  const ReactActual = require("react");
  const { Text } = require("react-native");
  return {
    WebView: ({ source }: { source?: { html?: string } }) => {
      const html = source?.html ?? "";
      const remote = html.includes("fonts.googleapis.com") || html.includes("fonts.gstatic.com");
      return ReactActual.createElement(Text, null, remote ? "Remote font" : "Local message");
    },
  };
});

const routeParams: { id?: string } = { id: "900001" };

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

import NotificationScreen from "@/app/(root)/notification/[id]";
import useAuthStore from "@/store/use-auth-store";
import {
  armNotificationDetailFailure,
  armNotificationListFailure,
  armNotificationOwnershipMismatch,
  fixtureCalls,
  holdNextNotificationDetail,
  holdNextNotificationList,
  releaseNotification,
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
    renderer = TestRenderer.create(hosted(<NotificationScreen />, queryClient));
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

function messageCalls(fragment: string) {
  return fixtureCalls().filter((call) => call.path.includes(fragment));
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

describe("PromaxCare mobile fixture notification access", () => {
  beforeEach(() => {
    resetFixtureBridge();
    routeParams.id = "900001";
    signIn();
  });

  afterEach(async () => {
    await releaseMounted();
  });

  it("shows the assigned notice without requesting a remote font", async () => {
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "Fixture notice")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Local message")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Remote font")).toBe(0);
    expect(messageCalls("/Messages/900001").length).toBeGreaterThan(0);
    expect(messageCalls("/Messages/4")).toHaveLength(0);
  });

  it("shows denial for an unlisted notification and does not request it", async () => {
    routeParams.id = "4";
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(
      textCount(renderer.root, "This notification is not assigned to your sign-in.")
    ).toBeGreaterThan(0);
    expect(messageCalls("/Messages/inbox?userId=fixture-user")).toHaveLength(1);
    expect(messageCalls("/Messages/4")).toHaveLength(0);
    expect(messageCalls("/Messages/900001")).toHaveLength(0);
    expect(textCount(renderer.root, "Local message")).toBe(0);
  });

  it("shows the loader while the inbox is held", async () => {
    holdNextNotificationList();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "Opening Notification..")).toBeGreaterThan(0);
    expect(
      textCount(renderer.root, "This notification is not assigned to your sign-in.")
    ).toBe(0);
    expect(messageCalls("/Messages/inbox")).toHaveLength(1);

    releaseNotification();
    await flush();
    expect(textCount(renderer.root, "Fixture notice")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Remote font")).toBe(0);
  });

  it("shows an error when the inbox fails and loads the notice on retry", async () => {
    armNotificationListFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "This notification could not be loaded.")).toBeGreaterThan(
      0
    );
    expect(
      textCount(renderer.root, "This notification is not assigned to your sign-in.")
    ).toBe(0);
    pressLabel(renderer.root, "Retry");
    await flush();

    expect(messageCalls("/Messages/inbox")).toHaveLength(2);
    expect(textCount(renderer.root, "Fixture notice")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Remote font")).toBe(0);
  });

  it("keeps one detail retry while that request is loading", async () => {
    armNotificationDetailFailure();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(textCount(renderer.root, "This notification could not be loaded.")).toBeGreaterThan(
      0
    );
    expect(messageCalls("/Messages/900001")).toHaveLength(1);

    holdNextNotificationDetail();
    pressLabel(renderer.root, "Retry");
    await flush();
    expect(messageCalls("/Messages/900001")).toHaveLength(2);
    expect(textCount(renderer.root, "Opening Notification..")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Retry")).toBe(0);

    releaseNotification();
    await flush();
    expect(textCount(renderer.root, "Fixture notice")).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Remote font")).toBe(0);
  });

  it("does not open a notice that belongs to another company", async () => {
    armNotificationOwnershipMismatch();
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(
      textCount(renderer.root, "This notification is not assigned to your sign-in.")
    ).toBeGreaterThan(0);
    expect(messageCalls("/Messages/900001").length).toBeGreaterThan(0);
    expect(textCount(renderer.root, "Fixture notice")).toBe(0);
    expect(textCount(renderer.root, "Local message")).toBe(0);
    expect(textCount(renderer.root, "Remote font")).toBe(0);
  });
});
