import React from "react";
import { Pressable, TextInput } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { notifyManager } from "@tanstack/query-core";

notifyManager.setScheduler((callback) => {
  callback();
});
import EditInfoForm from "@/modules/profile/edit-otherinfo-form";

/**
 * The app depends on React 19. The top-level `react-test-renderer` pin is 18
 * and cannot mount this tree. Jest Expo already carries renderer 19; use that
 * when it is the copy that matches React.
 */
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

const mockEditProfile = jest.fn();
const mockShowMessage = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@/hooks/queries/profile", () => {
  const data = {
    staffId: 4,
    instagram: "old-ig",
    linkedIn: "old-li",
    facebook: "",
    youtube: "",
    twitter: "",
  };
  return {
    profileQuery: {
      useFetchStaffProfile: () => ({ data }),
    },
  };
});

jest.mock("@/store/use-auth-store", () => ({
  __esModule: true,
  default: () => ({
    user: { userId: "user-4" },
    staff: { staffId: 4 },
  }),
}));

jest.mock("@/services/profile", () => ({
  profileService: {
    handleEditStaffProfile: (...args: unknown[]) => mockEditProfile(...args),
  },
}));

jest.mock("expo-router", () => ({
  router: { back: () => mockGoBack() },
}));

jest.mock("react-native-flash-message", () => ({
  showMessage: (...args: unknown[]) => mockShowMessage(...args),
}));

jest.mock("react-native-keyboard-aware-scroll-view", () => {
  const React = require("react");
  const { ScrollView } = require("react-native");
  return {
    KeyboardAwareScrollView: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
    }) => <ScrollView {...props}>{children}</ScrollView>,
  };
});

jest.mock("@/libs/query", () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock("@/components/shared/input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return {
    __esModule: true,
    default: ({
      label,
      value,
      onChangeText,
    }: {
      label?: string;
      value?: string;
      onChangeText?: (value: string) => void;
    }) => (
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
      />
    ),
  };
});

jest.mock("@/components/shared/custom-button", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({
      title,
      onPress,
    }: {
      title: string;
      onPress?: () => void;
    }) => (
      <Pressable accessibilityLabel={title} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

/**
 * Jest does not open a device keyboard. This is the native first-tap rule:
 * while the keyboard is open, the first press is delivered only from inside
 * a scroll view that keeps taps. A press outside that view only dismisses
 * the keyboard. A source-file attribute check is not this test and is not
 * a device pass.
 */
function firstTapReachesPress(
  target: ReactTestInstance,
  keyboardOpen: boolean
): boolean {
  if (!keyboardOpen) return true;
  let node: ReactTestInstance | null = target;
  while (node) {
    const persist = node.props?.keyboardShouldPersistTaps;
    if (persist === "handled" || persist === "always") return true;
    node = node.parent;
  }
  return false;
}

function field(
  renderer: ReturnType<typeof renderForm>["renderer"],
  label: string
) {
  const match = renderer.root
    .findAllByType(TextInput)
    .find((node) => node.props.accessibilityLabel === label);
  if (!match) throw new Error(`missing field ${label}`);
  return match;
}

function renderForm() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <QueryClientProvider client={client}>
        <EditInfoForm id="4" />
      </QueryClientProvider>
    );
  });
  return { renderer: renderer!, client };
}

describe("other-info Save while the keyboard is open", () => {
  beforeEach(() => {
    mockEditProfile.mockReset();
    mockShowMessage.mockReset();
    mockGoBack.mockReset();
  });

  it("sends the first Save tap and keeps the typed text when the save fails", async () => {
    mockEditProfile.mockRejectedValue({
      response: { data: { message: "Could not save" } },
    });
    const { renderer, client } = renderForm();
    const instagram = field(renderer, "Instagram");
    expect(instagram.props.value).toBe("old-ig");

    await act(async () => {
      instagram.props.onChangeText("kept-handle");
    });
    expect(field(renderer, "Instagram").props.value).toBe("kept-handle");

    const save = renderer.root.findByType(Pressable);
    expect(save.props.accessibilityLabel).toBe("Save Changes");
    expect(firstTapReachesPress(save, true)).toBe(true);

    await act(async () => {
      save.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockEditProfile).toHaveBeenCalledTimes(1);
    expect(mockEditProfile.mock.calls[0][2]).toEqual(
      expect.objectContaining({ instagram: "kept-handle" })
    );
    expect(mockShowMessage).toHaveBeenCalledWith({
      message: "Could not save",
      type: "danger",
    });
    expect(mockGoBack).not.toHaveBeenCalled();
    expect(field(renderer, "Instagram").props.value).toBe("kept-handle");

    mockEditProfile.mockRejectedValueOnce({
      response: { data: { message: "Could not save" } },
    });
    await act(async () => {
      renderer.root.findByType(Pressable).props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mockEditProfile).toHaveBeenCalledTimes(2);
    expect(mockEditProfile.mock.calls[1][2]).toEqual(
      expect.objectContaining({ instagram: "kept-handle" })
    );
    expect(field(renderer, "Instagram").props.value).toBe("kept-handle");
    await act(async () => {
      renderer.unmount();
    });
    client.clear();
  });
});
