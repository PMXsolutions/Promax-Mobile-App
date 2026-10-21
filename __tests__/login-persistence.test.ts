import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";
import {
  cooldownForEmail,
  emailAwaitingConfirmation,
  evaluateMailCooldown,
  resetUnconfirmedEmailsForTests,
  signInRepeatDecision,
} from "@/libs/login-failure";
import {
  MAIL_COOLDOWN_STORAGE_KEY,
  UNCONFIRMED_EMAIL_STORAGE_KEY,
  loadMailCooldownBook,
  loadUnconfirmedEmails,
  mailCooldownReadFailed,
  persistUnconfirmedEmail,
  resetMailCooldownMemoryForTests,
  saveMailCooldown,
  unconfirmedReadFailed,
} from "@/libs/login-mail-guard";

jest.mock("@react-native-async-storage/async-storage", () => {
  const memory = new Map<string, string>();
  const state = { getThrows: false, setThrows: false };
  return {
    getItem: async (key: string) => {
      if (state.getThrows) throw new Error("async get");
      return memory.get(key) ?? null;
    },
    setItem: async (key: string, value: string) => {
      if (state.setThrows) throw new Error("async set");
      memory.set(key, value);
    },
    __memory: memory,
    __state: state,
  };
});

jest.mock("expo-secure-store", () => {
  const memory = new Map<string, string>();
  const state = { getThrows: false, setThrows: false };
  return {
    getItemAsync: async (key: string) => {
      if (state.getThrows) throw new Error("secure get");
      return memory.get(key) ?? null;
    },
    setItemAsync: async (key: string, value: string) => {
      if (state.setThrows) throw new Error("secure set");
      memory.set(key, value);
    },
    __memory: memory,
    __state: state,
  };
});

jest.mock("expo-file-system", () => {
  const memory = new Map<string, string>();
  const state = { getThrows: false, setThrows: false };
  return {
    documentDirectory: "file:///promax-test/",
    readAsStringAsync: async (path: string) => {
      if (state.getThrows) throw new Error("file get");
      if (!memory.has(path)) throw new Error("File does not exist");
      return memory.get(path) ?? null;
    },
    writeAsStringAsync: async (path: string, value: string) => {
      if (state.setThrows) throw new Error("file set");
      memory.set(path, value);
    },
    __memory: memory,
    __state: state,
  };
});

const asyncStore = AsyncStorage as unknown as {
  __memory: Map<string, string>;
  __state: { getThrows: boolean; setThrows: boolean };
};
const secureStore = SecureStore as unknown as {
  __memory: Map<string, string>;
  __state: { getThrows: boolean; setThrows: boolean };
};
const fileStore = FileSystem as unknown as {
  __memory: Map<string, string>;
  __state: { getThrows: boolean; setThrows: boolean };
};

beforeEach(() => {
  asyncStore.__memory.clear();
  secureStore.__memory.clear();
  asyncStore.__state.getThrows = false;
  asyncStore.__state.setThrows = false;
  secureStore.__state.getThrows = false;
  secureStore.__state.setThrows = false;
  fileStore.__memory.clear();
  fileStore.__state.getThrows = false;
  fileStore.__state.setThrows = false;
  resetUnconfirmedEmailsForTests();
  resetMailCooldownMemoryForTests();
});

describe("sign-in persistence across a restart", () => {
  it("restores an unconfirmed address after the memory set is cleared", async () => {
    expect(await persistUnconfirmedEmail("Staff@Example.com")).toBe(true);
    const stored = secureStore.__memory.get(UNCONFIRMED_EMAIL_STORAGE_KEY);
    expect(stored).toContain("staff@example.com");
    expect(stored).not.toContain("password");

    resetUnconfirmedEmailsForTests();
    expect(emailAwaitingConfirmation("staff@example.com")).toBe(false);
    await loadUnconfirmedEmails();
    expect(emailAwaitingConfirmation("staff@example.com")).toBe(true);
    expect(emailAwaitingConfirmation("other@example.com")).toBe(false);
  });

  it("restores an unconfirmed address when AsyncStorage cannot save", async () => {
    asyncStore.__state.setThrows = true;
    expect(await persistUnconfirmedEmail("staff@example.com")).toBe(true);
    expect(asyncStore.__memory.has(UNCONFIRMED_EMAIL_STORAGE_KEY)).toBe(false);
    resetUnconfirmedEmailsForTests();
    await loadUnconfirmedEmails();
    expect(emailAwaitingConfirmation("staff@example.com")).toBe(true);
  });

  it("keeps the hour when AsyncStorage cannot save and a later read is empty", async () => {
    asyncStore.__state.setThrows = true;
    const saved = await saveMailCooldown({
      email: "staff@example.com",
      untilIso: "2026-10-21T09:00:00.000Z",
    });
    expect(saved).toBe(true);
    expect(asyncStore.__memory.has(MAIL_COOLDOWN_STORAGE_KEY)).toBe(false);
    const secure = secureStore.__memory.get(MAIL_COOLDOWN_STORAGE_KEY) ?? "";
    expect(secure).toContain("staff@example.com");
    expect(secure).not.toContain("secret-password");

    resetMailCooldownMemoryForTests();
    const book = await loadMailCooldownBook();
    expect(
      evaluateMailCooldown({
        cooldown: cooldownForEmail(book, "staff@example.com"),
        email: "staff@example.com",
        now: new Date("2026-10-21T08:30:00.000Z"),
      }).blocked
    ).toBe(true);
  });

  it("does not send when both stores fail to read", async () => {
    asyncStore.__state.getThrows = true;
    secureStore.__state.getThrows = true;
    await loadMailCooldownBook();
    await loadUnconfirmedEmails();
    expect(mailCooldownReadFailed()).toBe(true);
    expect(unconfirmedReadFailed()).toBe(true);
  });

  it("keeps an unconfirmed address when both stores reject the write and a later read is empty", async () => {
    asyncStore.__state.setThrows = true;
    secureStore.__state.setThrows = true;
    expect(await persistUnconfirmedEmail("Staff@Example.com")).toBe(true);
    expect(asyncStore.__memory.has(UNCONFIRMED_EMAIL_STORAGE_KEY)).toBe(false);
    expect(secureStore.__memory.has(UNCONFIRMED_EMAIL_STORAGE_KEY)).toBe(false);
    const saved = [...fileStore.__memory.values()].join("\n");
    expect(saved).toContain("staff@example.com");
    expect(saved).not.toContain("password");

    resetUnconfirmedEmailsForTests();
    expect(emailAwaitingConfirmation("staff@example.com")).toBe(false);
    await loadUnconfirmedEmails();
    expect(emailAwaitingConfirmation("staff@example.com")).toBe(true);
    expect(signInRepeatDecision(null, "staff@example.com")).toBe("otp");
    expect(signInRepeatDecision(null, "other@example.com")).toBe("post");
  });

  it("keeps the hour when both stores reject the write and a later read is empty", async () => {
    asyncStore.__state.setThrows = true;
    secureStore.__state.setThrows = true;
    const saved = await saveMailCooldown({
      email: "staff@example.com",
      untilIso: "2026-10-21T09:00:00.000Z",
    });
    expect(saved).toBe(true);
    expect(asyncStore.__memory.has(MAIL_COOLDOWN_STORAGE_KEY)).toBe(false);
    expect(secureStore.__memory.has(MAIL_COOLDOWN_STORAGE_KEY)).toBe(false);
    const file = [...fileStore.__memory.values()].join("\n");
    expect(file).toContain("staff@example.com");
    expect(file).not.toContain("secret-password");

    resetMailCooldownMemoryForTests();
    asyncStore.__memory.clear();
    secureStore.__memory.clear();
    const book = await loadMailCooldownBook();
    expect(mailCooldownReadFailed()).toBe(false);
    expect(
      evaluateMailCooldown({
        cooldown: cooldownForEmail(book, "staff@example.com"),
        email: "staff@example.com",
        now: new Date("2026-10-21T08:30:00.000Z"),
      }).blocked
    ).toBe(true);
  });

  it("does not drop the hour when every copy rejects the write and a later read is empty", async () => {
    asyncStore.__state.setThrows = true;
    secureStore.__state.setThrows = true;
    fileStore.__state.setThrows = true;
    expect(
      await saveMailCooldown({
        email: "staff@example.com",
        untilIso: "2026-10-21T09:00:00.000Z",
      })
    ).toBe(false);
    asyncStore.__state.setThrows = false;
    secureStore.__state.setThrows = false;
    fileStore.__state.setThrows = false;
    const book = await loadMailCooldownBook();
    expect(
      evaluateMailCooldown({
        cooldown: cooldownForEmail(book, "staff@example.com"),
        email: "staff@example.com",
        now: new Date("2026-10-21T08:30:00.000Z"),
      }).blocked
    ).toBe(true);
  });
});
