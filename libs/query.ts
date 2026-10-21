// import { QueryClient } from "@tanstack/react-query";

// export const queryClient = new QueryClient();

import { QueryClient } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/libs/session-status";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
});
