export interface SingleFlightLock {
  held: boolean;
}

export function acquireSingleFlight(lock: SingleFlightLock): boolean {
  if (lock.held) return false;
  lock.held = true;
  return true;
}

export function releaseSingleFlight(lock: SingleFlightLock): void {
  lock.held = false;
}
