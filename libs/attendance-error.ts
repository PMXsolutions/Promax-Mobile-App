interface ErrorLike {
  isAxiosError?: boolean;
  message?: string;
  response?: {
    data?: {
      message?: string;
      Message?: string;
    };
  };
}

export function attendanceErrorMessage(
  error: unknown,
  action: "clock in" | "clock out"
): string {
  const candidate =
    error && typeof error === "object" ? (error as ErrorLike) : undefined;

  if (candidate?.isAxiosError) {
    if (!candidate.response) {
      return `Could not ${action} because the connection dropped. Check this shift before trying again.`;
    }
    const serverMessage =
      candidate.response.data?.message || candidate.response.data?.Message;
    return (
      serverMessage ||
      `Could not ${action}. Check this shift before trying again.`
    );
  }

  return `Could not ${action}. Check this shift before trying again.`;
}
