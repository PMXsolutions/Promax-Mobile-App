// import { QueryClient } from "@tanstack/react-query";

// export const queryClient = new QueryClient();

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  // defaultOptions: {
  //   queries: {
  //     staleTime: 1000 * 60 * 5, // 5 minutes
  //     gcTime: 1000 * 60 * 60 * 24, // 24 hours (cacheTime renamed to gcTime in v5)
  //   },
  // },
});
