export function generateStaticMapUrl(
  route: { latitude: number; longitude: number }[],
  apiKey: string
): string {
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap?";
  const size = "600x300";
  const path = route.map((p) => `${p.latitude},${p.longitude}`).join("|");

  return `${baseUrl}size=${size}&path=color:0x0000ff|weight:4|${path}&key=${apiKey}`;
}
