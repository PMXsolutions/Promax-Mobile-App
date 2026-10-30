/**
 * Jest stand-in for expo-secure-store. It keeps values in memory for this
 * process. It is not Keychain or Keystore.
 */

const memory = new Map<string, string>();

export async function getItemAsync(key: string): Promise<string | null> {
  return memory.get(key) ?? null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  memory.set(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  memory.delete(key);
}

export function __resetMemorySecureStore(): void {
  memory.clear();
}
