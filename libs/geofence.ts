export const CLOCK_IN_RADIUS_METERS = 1000;

export function geofenceDecision(
  distanceMeters: number,
  radiusMeters = CLOCK_IN_RADIUS_METERS
): "inside" | "outside" {
  return distanceMeters > radiusMeters ? "outside" : "inside";
}

export function hasClientCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean {
  return !!latitude && !!longitude && latitude !== 0 && longitude !== 0;
}
