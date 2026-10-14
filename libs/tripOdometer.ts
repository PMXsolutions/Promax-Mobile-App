/** A calculated map distance is not an odometer reading and is not invoice evidence. */
export function tripOdometerRefusal(startKm: number | null, endKm: number | null): string | null {
  if (startKm == null || endKm == null || !(startKm > 0) || !(endKm > startKm)) {
    return 'This trip was not stored. Enter a start reading and a greater end reading before a distance can be kept. A calculated distance is not an odometer record and is not invoice evidence.';
  }
  return null;
}
