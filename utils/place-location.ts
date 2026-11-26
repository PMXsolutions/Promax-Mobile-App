// Places API (New) uses location.latitude/longitude, not legacy geometry.
export function readPlaceLocation(details: unknown): { latitude: number; longitude: number } | null {
  const location = (details as { location?: { latitude?: unknown; longitude?: unknown } } | null)?.location;
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number" ||
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}
