import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MailCooldownRecord,
  normalizeLoginEmail,
  parseMailCooldown,
} from "@/libs/login-failure";

export const MAIL_COOLDOWN_STORAGE_KEY = "promaxcare.login-mail-cooldown";

let memoryCooldown: MailCooldownRecord | null = null;

export function resetMailCooldownMemoryForTests(): void {
  memoryCooldown = null;
}

export async function loadMailCooldown(): Promise<MailCooldownRecord | null> {
  if (memoryCooldown) return memoryCooldown;

  try {
    const raw = await AsyncStorage.getItem(MAIL_COOLDOWN_STORAGE_KEY);
    memoryCooldown = parseMailCooldown(raw);
    return memoryCooldown;
  } catch {
    return memoryCooldown;
  }
}

export async function saveMailCooldown(
  record: MailCooldownRecord
): Promise<void> {
  memoryCooldown = {
    email: normalizeLoginEmail(record.email),
    untilIso: record.untilIso,
  };

  try {
    await AsyncStorage.setItem(
      MAIL_COOLDOWN_STORAGE_KEY,
      JSON.stringify(memoryCooldown)
    );
  } catch {
    // The in-memory copy still blocks another sign-in request in this session.
  }
}
