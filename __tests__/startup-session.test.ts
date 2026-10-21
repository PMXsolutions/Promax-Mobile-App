import { bindAuthHydration } from "@/libs/auth-hydration";
import { sessionActionForStatus } from "@/libs/session-status";
import {
  FONT_LOAD_TIMEOUT_MS,
  fontFamilyForStartup,
  setStartupFontsReady,
  shouldBlockStartupForFonts,
} from "@/libs/startup-fonts";
import fs from "fs";
import path from "path";

describe("startup font gate", () => {
  afterEach(() => {
    setStartupFontsReady(false);
  });

  it("keeps the splash only while fonts are still loading", () => {
    expect(
      shouldBlockStartupForFonts({
        fontsLoaded: false,
        fontError: null,
        timedOut: false,
      })
    ).toBe(true);
  });

  it("opens the app when font loading fails", () => {
    expect(
      shouldBlockStartupForFonts({
        fontsLoaded: false,
        fontError: new Error("font download failed"),
        timedOut: false,
      })
    ).toBe(false);
  });

  it("opens the app when font loading exceeds the timeout", () => {
    expect(FONT_LOAD_TIMEOUT_MS).toBe(8000);
    expect(
      shouldBlockStartupForFonts({
        fontsLoaded: false,
        fontError: null,
        timedOut: true,
      })
    ).toBe(false);
  });

  it("uses a system font until the custom fonts are ready", () => {
    setStartupFontsReady(false);
    expect(fontFamilyForStartup("Inter_400Regular")).toBeUndefined();
    setStartupFontsReady(true);
    expect(fontFamilyForStartup("Inter_400Regular")).toBe("Inter_400Regular");
  });
});

describe("auth hydration", () => {
  it("marks hydration immediately when persist already finished", () => {
    const marks: string[] = [];
    const unsubscribe = jest.fn();
    const persist = {
      hasHydrated: () => true,
      onFinishHydration: () => {
        marks.push("subscribed");
        return unsubscribe;
      },
    };

    const stop = bindAuthHydration(persist, () => marks.push("hydrated"));

    expect(marks).toEqual(["hydrated", "subscribed"]);
    expect(stop).toBe(unsubscribe);
  });

  it("waits for a late hydration event instead of staying on the loader", () => {
    let finish: (() => void) | undefined;
    const marks: string[] = [];
    const persist = {
      hasHydrated: () => false,
      onFinishHydration: (callback: () => void) => {
        finish = callback;
        return () => undefined;
      },
    };

    bindAuthHydration(persist, () => marks.push("hydrated"));
    expect(marks).toEqual([]);
    finish?.();
    expect(marks).toEqual(["hydrated"]);
  });
});

describe("session status", () => {
  it("expires the session on 401 and keeps it on 403", () => {
    expect(sessionActionForStatus(401)).toBe("expire");
    expect(sessionActionForStatus(403)).toBe("keep");
    expect(sessionActionForStatus(500)).toBe("keep");
    expect(sessionActionForStatus(undefined)).toBe("keep");
  });
});

describe("sign-in touch contract", () => {
  const read = (relativePath: string) =>
    fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

  it("does not wrap the email and password fields in a keyboard-dismiss touch target", () => {
    expect(read("components/shared/input.tsx")).not.toContain(
      "TouchableWithoutFeedback"
    );
    expect(read("components/shared/password-input.tsx")).not.toContain(
      "TouchableWithoutFeedback"
    );
  });

  it("lets the sign-in button receive a tap while the keyboard is open", () => {
    const screen = read("app/(auth)/sign-in.tsx");
    expect(screen).not.toContain("<ScrollView");
    expect(screen).not.toContain("keyboardDismissMode");
    expect(read("components/wrapper/keyboard-aware-wrapper.tsx")).toContain(
      'keyboardShouldPersistTaps="handled"'
    );
  });

  it("holds a mail failure without sending another login or resend", () => {
    const form = read("modules/auth/sign-in-form.tsx");
    const openAt = form.indexOf("const openExistingCode");
    const submitAt = form.indexOf("const handleFormSubmit");
    expect(openAt).toBeGreaterThan(submitAt);
    const openBody = form.slice(openAt, form.indexOf("const sessionExpired"));
    expect(openBody).toContain("holdMail=1");
    expect(openBody).not.toContain("loginUser");
    expect(openBody).not.toContain("resend_otp");
    expect(form).toContain("!control.submitEnabled");

    const otp = read("app/(auth)/otp-verification/[email].tsx");
    const holdAt = otp.indexOf("if (holdMail)");
    const resendAt = otp.indexOf("/Account/resend_otp");
    expect(holdAt).toBeGreaterThan(-1);
    expect(holdAt).toBeLessThan(resendAt);
    expect(otp).toContain("will not send another email");
  });
});
