/**
 * PromaxCare mobile sign-in sentence rule.
 * A message that is `email not confirmed`, or starts with `email not confirmed.`,
 * is the unconfirmed-email case. A mail-rate message does not match.
 */
export function isEmailUnconfirmedMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized === "email not confirmed" ||
    normalized.startsWith("email not confirmed.")
  );
}
