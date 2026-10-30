import React from "react";
import { Alert } from "react-native";
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

jest.mock("expo-location", () => ({
  Accuracy: { High: 4 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

jest.mock("@/components/transport/MapViewTrip", () => {
  const ReactActual = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: () => ReactActual.createElement(Text, null, "Live map"),
  };
});

jest.mock("@/components/map/google-text-input", () => {
  const ReactActual = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({
      handlePress,
    }: {
      handlePress: (location: {
        latitude: number;
        longitude: number;
        address?: string;
      }) => void;
    }) =>
      ReactActual.createElement(
        Pressable,
        {
          onPress: () =>
            handlePress({ latitude: -33.8, longitude: 151.2, address: "Fixture" }),
        },
        ReactActual.createElement(Text, null, "Set destination")
      ),
  };
});

const routeParams: { id?: string } = { id: "900001" };
const mockBack = jest.fn();
const mockShowMessage = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => routeParams,
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    navigate: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  },
  Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

jest.mock("react-native-flash-message", () => ({
  showMessage: (...args: unknown[]) => mockShowMessage(...args),
}));

import * as Location from "expo-location";
import TripScreen from "@/app/(root)/transport/trip-screen";
import useAuthStore from "@/store/use-auth-store";
import {
  armMileageFailure,
  fixtureCalls,
  holdNextMileage,
  releaseMileage,
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
    renderer = TestRenderer.create(hosted(<TripScreen />, queryClient));
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

function mileageCalls() {
  return fixtureCalls().filter((call) =>
    call.path.startsWith("/ShiftRosters/fill_mileage")
  );
}

function signIn(staffId: number) {
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
        staffId,
        firstName: "Fixture",
        imageUrl: "",
      } as never,
    });
  });
}

describe("PromaxCare mobile fixture mileage summary", () => {
  beforeEach(() => {
    resetFixtureBridge();
    routeParams.id = "900001";
    mockBack.mockClear();
    mockShowMessage.mockClear();
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
      canAskAgain: false,
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
      new Error("position unavailable")
    );
    (Location.watchPositionAsync as jest.Mock).mockRejectedValue(
      new Error("watch unavailable")
    );
    signIn(900001);
  });

  afterEach(async () => {
    await releaseMounted();
    jest.restoreAllMocks();
  });

  async function openSummary(renderer: ReactTestRenderer) {
    await flush();
    pressLabel(renderer.root, "Enter mileage");
    await flush();
  }

  it("opens the odometer summary when location is denied and the map is not shown", async () => {
    const renderer = await mount(fixtureQueryClient());
    await flush();

    expect(
      renderer.root.findAll((node) => node.props?.children === "Live map")
    ).toHaveLength(0);
    expect(
      renderer.root.findAll(
        (node) => node.props?.children === "Location is off, so the map is not tracking this trip."
      ).length
    ).toBeGreaterThan(0);
    pressLabel(renderer.root, "Enter mileage");
    await flush();
    expect(
      renderer.root.findAll((node) => node.props?.children === "Live map")
    ).toHaveLength(0);
    fillPlaceholder(renderer.root, "Start odometer (km)", "10");
    fillPlaceholder(renderer.root, "End odometer (km)", "12");
    pressLabel(renderer.root, "Save mileage");
    await flush();

    expect(mileageCalls()).toEqual([
      {
        method: "GET",
        path: "/ShiftRosters/fill_mileage?shiftId=900001&startKm=10&endKm=12",
      },
    ]);
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Mileage saved",
      type: "success",
    });
  });

  it("opens the odometer summary when the map watch fails", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
      canAskAgain: true,
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: -33.8688, longitude: 151.2093 },
    });
    const renderer = await mount(fixtureQueryClient());
    await flush();
    expect(
      renderer.root.findAll((node) => node.props?.children === "Live map").length
    ).toBeGreaterThan(0);

    pressLabel(renderer.root, "Set destination");
    const start = renderer.root.findAll((node) => node.props?.children === "Start Trip");
    expect(start.length).toBeGreaterThan(0);
    const startButton = start[0].parent?.findAll(
      (node) => typeof node.props?.onPress === "function"
    )[0];
    if (!startButton) throw new Error("No start control");
    await act(async () => {
      await startButton.props.onPress();
    });
    await flush();

    expect(
      renderer.root.findAll(
        (node) =>
          node.props?.children ===
          "The map is unavailable, so this trip is not being tracked."
      ).length
    ).toBeGreaterThan(0);
    pressLabel(renderer.root, "Enter mileage");
    await flush();
    expect(
      renderer.root.findAll(
        (node) => node.props?.placeholder === "Start odometer (km)"
      ).length
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAll((node) => node.props?.children === "Live map")
    ).toHaveLength(0);
  });

  it("keeps one mileage request while the save is loading and ignores the duplicate tap", async () => {
    const renderer = await mount(fixtureQueryClient());
    await openSummary(renderer);
    fillPlaceholder(renderer.root, "Start odometer (km)", "10");
    fillPlaceholder(renderer.root, "End odometer (km)", "14");
    holdNextMileage();
    pressLabel(renderer.root, "Save mileage");
    await flush();

    expect(mileageCalls()).toHaveLength(1);
    expect(
      renderer.root.findAll((node) => node.props?.children === "Save Trip")
    ).toHaveLength(0);
    pressLabel(renderer.root, "Save mileage");
    await flush();
    expect(mileageCalls()).toHaveLength(1);

    releaseMileage();
    await flush();
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Mileage saved",
      type: "success",
    });
  });

  it("keeps the typed odometer when the save fails and sends it again on retry", async () => {
    const renderer = await mount(fixtureQueryClient());
    await openSummary(renderer);
    fillPlaceholder(renderer.root, "Start odometer (km)", "20");
    fillPlaceholder(renderer.root, "End odometer (km)", "25");
    armMileageFailure();
    pressLabel(renderer.root, "Save mileage");
    await flush();

    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Could not save mileage",
      type: "danger",
    });
    const start = renderer.root.findAll(
      (node) => node.props?.placeholder === "Start odometer (km)"
    );
    const end = renderer.root.findAll(
      (node) => node.props?.placeholder === "End odometer (km)"
    );
    expect(start[0].props.value).toBe("20");
    expect(end[0].props.value).toBe("25");
    expect(mockBack).not.toHaveBeenCalled();

    pressLabel(renderer.root, "Save mileage");
    await flush();
    expect(mileageCalls()).toHaveLength(2);
    expect(mileageCalls()[1].path).toBe(
      "/ShiftRosters/fill_mileage?shiftId=900001&startKm=20&endKm=25"
    );
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Mileage saved",
      type: "success",
    });
  });

  it("does not send mileage for a shift outside the signed-in roster", async () => {
    routeParams.id = "4";
    const renderer = await mount(fixtureQueryClient());
    await openSummary(renderer);
    fillPlaceholder(renderer.root, "Start odometer (km)", "10");
    fillPlaceholder(renderer.root, "End odometer (km)", "12");
    pressLabel(renderer.root, "Save mileage");
    await flush();

    expect(Alert.alert).toHaveBeenCalledWith(
      "Mileage not saved",
      "This shift is not assigned to your sign-in, so mileage was not sent.",
      [{ text: "OK" }]
    );
    expect(mileageCalls()).toHaveLength(0);
    expect(
      renderer.root.findAll(
        (node) => node.props?.placeholder === "Start odometer (km)"
      )[0].props.value
    ).toBe("10");
  });
});
