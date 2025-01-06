import AsyncStorage from "@react-native-async-storage/async-storage";
// "accessToken"
const tokenService = {
  getItem: async (name: string) => {
    return await AsyncStorage.getItem(name);
  },
  setItem: (name: string, token: string) => {
    return AsyncStorage.setItem(name, token);
  },
  removeItem: async (name: string) => {
    return await AsyncStorage.removeItem(name);
  },
};
export default tokenService;
