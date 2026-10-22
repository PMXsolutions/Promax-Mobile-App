import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { notifyManager } from "@tanstack/query-core";

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

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockShowMessage = jest.fn();

jest.mock("expo-router", () => ({
  router: {
    navigate: (...args: unknown[]) => mockNavigate(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
    back: (...args: unknown[]) => mockBack(...args),
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

jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const ReactActual = require("react");
  const { ScrollView } = require("react-native");
  return {
    KeyboardAwareScrollView: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
    }) =>
      ReactActual.createElement(ScrollView, props, children),
  };
});

jest.mock("@/components/wrapper/screen-wrapper", () => {
  const ReactActual = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children?: React.ReactNode }) =>
      ReactActual.createElement(View, null, children),
  };
});

jest.mock("@/components/shared/header", () => {
  const ReactActual = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ name }: { name?: string }) =>
      ReactActual.createElement(Text, null, name ?? ""),
  };
});

jest.mock("@/components/shared/mini-loader", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/shift/banner/pending-shift", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/shift/beatiful-shift", () => {
  const ReactActual = require("react");
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({
      shiftData,
    }: {
      shiftData?: { shiftRosterId?: number }[];
    }) =>
      ReactActual.createElement(
        Text,
        null,
        (shiftData ?? []).map((shift) => String(shift.shiftRosterId)).join(",")
      ),
  };
});

import SignInForm from "@/modules/auth/sign-in-form";
import EditInfoForm from "@/modules/profile/edit-otherinfo-form";
import Activity from "@/app/(root)/(tabs)/index";
import useAuthStore from "@/store/use-auth-store";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import {
  armStaffEditFailure,
  fixtureCalls,
  fixtureSnapshot,
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

async function flush() {
  await act(async () => {
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

function fields(root: ReactTestInstance) {
  return root.findAll(
    (node) =>
      typeof node.props?.onChangeText === "function" &&
      node.props?.placeholder == null
  );
}

function signInAs(staffId: number) {
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

describe("PromaxCare mobile fixture rendered client", () => {
  beforeEach(() => {
    resetFixtureBridge();
    mockNavigate.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
    mockShowMessage.mockClear();
    act(() => {
      useAuthStore.setState({
        isAuthenticated: false,
        token: null,
        user: null,
        staff: null,
      });
    });
  });

  it("opens the code screen for an unconfirmed email and then signs the fixture staff in", async () => {
    let renderer: ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(hosted(<SignInForm />));
    });
    fillPlaceholder(renderer!.root, "Enter your email", "fixture.staff@example.invalid");
    fillPlaceholder(renderer!.root, "Enter your password", "unconfirmed");
    pressLabel(renderer!.root, "Sign In");
    await flush();

    expect(mockNavigate).toHaveBeenCalledWith(
      `/(auth)/otp-verification/${encodeURIComponent("fixture.staff@example.invalid")}`
    );
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "email not confirmed",
      type: "danger",
    });

    fillPlaceholder(renderer!.root, "Enter your password", "fixture");
    pressLabel(renderer!.root, "Sign In");
    await flush();

    expect(mockReplace).toHaveBeenCalledWith("/(root)/(tabs)");
    expect(useAuthStore.getState().token).toBe("fixture-token");
    expect(useAuthStore.getState().staff?.staffId).toBe(900001);
    await act(async () => {
      renderer!.unmount();
    });
  });

  it("keeps a generic sign-in failure off the code screen", async () => {
    let renderer: ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(hosted(<SignInForm />));
    });
    fillPlaceholder(renderer!.root, "Enter your email", "fixture.staff@example.invalid");
    fillPlaceholder(renderer!.root, "Enter your password", "wrong");
    pressLabel(renderer!.root, "Sign In");
    await flush();

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "invalid login attempt",
      type: "danger",
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    await act(async () => {
      renderer!.unmount();
    });
  });

  it("shows the fixture shift on the roster screen", async () => {
    signInAs(900001);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    let renderer: ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        hosted(<Activity />, queryClient)
      );
    });
    await flush();
    const text = renderer!.root.findAll((node) => node.props?.children === "900001");
    expect(text.length).toBeGreaterThan(0);
    expect(fixtureCalls().some((call) => call.path.startsWith("/ShiftRosters/get_shifts_by_user?client=&staff=900001"))).toBe(true);
    await act(async () => {
      renderer!.unmount();
    });
  });

  it("shows the roster error when the fixture denies the staff id", async () => {
    signInAs(4);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    let renderer: ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        hosted(<Activity />, queryClient)
      );
    });
    await flush();
    const denied = renderer!.root.findAll(
      (node) => node.props?.children === "Unable to load shift."
    );
    expect(denied.length).toBeGreaterThan(0);
    expect(
      fixtureCalls().some((call) => call.path.includes("staff=4"))
    ).toBe(true);
    await act(async () => {
      renderer!.unmount();
    });
  });

  it("keeps typed other-info text when the fixture refuses the save", async () => {
    signInAs(900001);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    let renderer: ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        hosted(<EditInfoForm id="900001" />, queryClient)
      );
    });
    await flush();
    const instagram = fields(renderer!.root)[0];
    expect(instagram.props.value).toBe("fixture-handle");
    act(() => {
      instagram.props.onChangeText("kept-handle");
    });
    armStaffEditFailure();
    pressLabel(renderer!.root, "Save Changes");
    await flush();

    expect(fields(renderer!.root)[0].props.value).toBe("kept-handle");
    expect(mockBack).not.toHaveBeenCalled();
    expect(fixtureSnapshot().instagram).toBe("fixture-handle");
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Could not save",
      type: "danger",
    });
    await act(async () => {
      renderer!.unmount();
    });
  });

  it("renders the other-info denial and does not request another staff record", async () => {
    signInAs(900001);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    let renderer: ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        hosted(<EditInfoForm id="4" />, queryClient)
      );
    });
    await flush();
    const denied = renderer!.root.findAll(
      (node) => node.props?.children === "This profile is not assigned to your sign-in."
    );
    expect(denied.length).toBeGreaterThan(0);
    expect(fixtureCalls().some((call) => call.path.includes("/Staffs/4"))).toBe(false);
    expect(fixtureCalls().some((call) => call.path.includes("/Staffs/edit/"))).toBe(false);
    await act(async () => {
      renderer!.unmount();
    });
  });
});
