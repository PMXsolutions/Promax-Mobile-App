/**
 * Jest stand-in for AsyncStorage. Values stay in this process only.
 */

const memory = new Map<string, string>();

const api = {
  getItem: async (key: string) => memory.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memory.set(key, value);
  },
  removeItem: async (key: string) => {
    memory.delete(key);
  },
  getAllKeys: async () => [...memory.keys()],
  multiRemove: async (keys: string[]) => {
    for (const key of keys) memory.delete(key);
  },
  clear: async () => {
    memory.clear();
  },
};

export default api;
