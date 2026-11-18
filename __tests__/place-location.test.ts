import { readPlaceLocation } from "../utils/place-location";

describe("Places API New location handling", () => {
  it("accepts a valid new API response including zero coordinates", () => {
    expect(readPlaceLocation({ location: { latitude: 0, longitude: 149.13 } }))
      .toEqual({ latitude: 0, longitude: 149.13 });
  });
  it.each([null, {}, { geometry: { location: { lat: -35, lng: 149 } } },
    { location: { latitude: NaN, longitude: 149 } },
    { location: { latitude: 91, longitude: 149 } },
    { location: { latitude: -35, longitude: 181 } }])
    ("does not submit malformed or legacy coordinates: %p", value => {
      expect(readPlaceLocation(value)).toBeNull();
    });
});
