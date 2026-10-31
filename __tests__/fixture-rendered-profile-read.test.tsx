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

import IdentityCard from "@/app/(root)/profile/identity";
import BankInfo from "@/app/(root)/profile/bank-info";
import EmergencyInfo from "@/app/(root)/profile/emergency-info";
import OtherInfo from "@/app/(root)/profile/other-info";
import useAuthStore from "@/store/use-auth-store";
import {
  armEmptyStaffProfile,
  armStaffProfileFailure,
  armStaffProfileMismatch,
  fixtureCalls,
  holdNextStaffProfile,
  releaseStaffProfile,
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

async function mount(node: React.ReactElement, queryClient: QueryClient) {
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

function staffGets() {
  return fixtureCalls().filter(
    (call) => call.path.includes("/Staffs/") && !call.path.includes("/edit/")
  );
}

function signIn(staffId: number | null = 900001) {
  act(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: "fixture-token",
      user: {
        userId: "fixture-user",
        companyId: 900001,
        role: "Staff",
      } as never,
      staff:
        staffId == null
          ? null
          : ({
              staffId,
              firstName: "Fixture",
              imageUrl: "",
            } as never),
    });
  });
}

function installReadCases(
  title: string,
  node: React.ReactElement,
  errorSentence: string,
  readySentence: string,
  emptySentence: string
) {
  describe(title, () => {
    beforeEach(() => {
      resetFixtureBridge();
      signIn();
    });

    afterEach(async () => {
      await releaseMounted();
    });

    it("shows a load error without the profile value or the empty sentence", async () => {
      armStaffProfileFailure();
      const renderer = await mount(node, fixtureQueryClient());
      await flush();
      expect(textCount(renderer.root, errorSentence)).toBeGreaterThan(0);
      expect(textCount(renderer.root, "Your staff profile is not available.")).toBe(0);
      expect(textCount(renderer.root, readySentence)).toBe(0);
      expect(textCount(renderer.root, emptySentence)).toBe(0);
      expect(staffGets()).toHaveLength(1);
    });

    it("shows the loader while the profile is held", async () => {
      holdNextStaffProfile();
      const renderer = await mount(node, fixtureQueryClient());
      await flush();
      expect(textCount(renderer.root, "Loading...")).toBeGreaterThan(0);
      expect(textCount(renderer.root, errorSentence)).toBe(0);
      expect(textCount(renderer.root, emptySentence)).toBe(0);
      expect(textCount(renderer.root, readySentence)).toBe(0);
      releaseStaffProfile();
      await flush();
      expect(textCount(renderer.root, readySentence)).toBeGreaterThan(0);
      expect(textCount(renderer.root, errorSentence)).toBe(0);
      expect(textCount(renderer.root, "Loading...")).toBe(0);
    });

    it("shows the empty value after a successful blank profile", async () => {
      armEmptyStaffProfile();
      const renderer = await mount(node, fixtureQueryClient());
      await flush();
      expect(textCount(renderer.root, emptySentence)).toBeGreaterThan(0);
      expect(textCount(renderer.root, errorSentence)).toBe(0);
      expect(textCount(renderer.root, "Your staff profile is not available.")).toBe(0);
      expect(textCount(renderer.root, readySentence)).toBe(0);
      expect(textCount(renderer.root, "Loading...")).toBe(0);
    });

    it("retries a failed profile without leaving the empty sentence up", async () => {
      armStaffProfileFailure();
      const renderer = await mount(node, fixtureQueryClient());
      await flush();
      holdNextStaffProfile();
      pressLabel(renderer.root, "Retry");
      await flush();
      expect(staffGets()).toHaveLength(2);
      expect(textCount(renderer.root, "Loading...")).toBeGreaterThan(0);
      expect(textCount(renderer.root, "Retry")).toBe(0);
      expect(textCount(renderer.root, emptySentence)).toBe(0);
      releaseStaffProfile();
      await flush();
      expect(textCount(renderer.root, errorSentence)).toBe(0);
      expect(textCount(renderer.root, readySentence)).toBeGreaterThan(0);
      expect(textCount(renderer.root, "Loading...")).toBe(0);
    });

    it("denies a missing staff id without requesting a profile", async () => {
      signIn(null);
      const renderer = await mount(node, fixtureQueryClient());
      await flush();
      expect(textCount(renderer.root, "Your staff profile is not available.")).toBeGreaterThan(
        0
      );
      expect(textCount(renderer.root, errorSentence)).toBe(0);
      expect(staffGets()).toHaveLength(0);
    });

    it("denies a profile from another company", async () => {
      armStaffProfileMismatch();
      const renderer = await mount(node, fixtureQueryClient());
      await flush();
      expect(textCount(renderer.root, "Your staff profile is not available.")).toBeGreaterThan(
        0
      );
      expect(textCount(renderer.root, readySentence)).toBe(0);
      expect(textCount(renderer.root, errorSentence)).toBe(0);
    });
  });
}

installReadCases(
  "PromaxCare mobile fixture identity card",
  <IdentityCard />,
  "Identity card could not be loaded.",
  "Fixture Staff",
  "No data available"
);

installReadCases(
  "PromaxCare mobile fixture bank information",
  <BankInfo />,
  "Bank information could not be loaded.",
  "Fixture Bank",
  "N/A"
);

installReadCases(
  "PromaxCare mobile fixture emergency contact",
  <EmergencyInfo />,
  "Emergency contact could not be loaded.",
  "Fixture Kin",
  "N/A"
);

installReadCases(
  "PromaxCare mobile fixture other information",
  <OtherInfo />,
  "Other information could not be loaded.",
  "fixture-handle",
  "N/A"
);
