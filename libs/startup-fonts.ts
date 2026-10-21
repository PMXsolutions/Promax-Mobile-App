export const FONT_LOAD_TIMEOUT_MS = 8000;

let fontsReady = false;

export function setStartupFontsReady(ready: boolean): void {
  fontsReady = ready;
}

export function areStartupFontsReady(): boolean {
  return fontsReady;
}

export function fontFamilyForStartup(family: string): string | undefined {
  return fontsReady ? family : undefined;
}

export function shouldBlockStartupForFonts(input: {
  fontsLoaded: boolean;
  fontError: unknown;
  timedOut: boolean;
}): boolean {
  if (input.fontsLoaded) return false;
  if (input.fontError) return false;
  if (input.timedOut) return false;
  return true;
}
