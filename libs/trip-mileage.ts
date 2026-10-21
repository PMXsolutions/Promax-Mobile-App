export interface MileageSubmitDecision {
  ok: true;
  startKm: number;
  endKm: number;
}

export interface MileageSubmitRefusal {
  ok: false;
  message: string;
}

function parseKm(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

/**
 * Map distance is an estimate. Mileage is stored only from odometer readings
 * where the end reading is greater than a positive start reading.
 */
export function mileageSubmitDecision(
  startInput: string,
  endInput: string
): MileageSubmitDecision | MileageSubmitRefusal {
  const startKm = parseKm(startInput);
  const endKm = parseKm(endInput);

  if (startKm == null || endKm == null) {
    return {
      ok: false,
      message:
        "Enter the odometer at the start and end of the trip. The map distance is an estimate and was not saved as mileage.",
    };
  }

  if (startKm <= 0 || endKm <= startKm) {
    return {
      ok: false,
      message:
        "The end odometer must be greater than the start odometer. Mileage was not sent.",
    };
  }

  return { ok: true, startKm, endKm };
}
