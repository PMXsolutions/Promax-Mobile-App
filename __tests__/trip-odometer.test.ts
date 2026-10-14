import { readFileSync } from 'fs';
import { join } from 'path';
import { tripOdometerRefusal } from '../libs/tripOdometer';

describe('trip odometer refusal', () => {
  it('refuses a missing or zero start instead of inventing kilometres', () => {
    expect(tripOdometerRefusal(null, null)).toMatch(/not stored/);
    expect(tripOdometerRefusal(0, 12)).toMatch(/not stored/);
    expect(tripOdometerRefusal(10, 10)).toMatch(/not stored/);
  });

  it('accepts only a positive start and a greater end', () => {
    expect(tripOdometerRefusal(10, 14)).toBeNull();
  });

  it('does not send the trip screen through fill_mileage', () => {
    const source = readFileSync(join(process.cwd(), 'app/(root)/transport/trip-screen.tsx'), 'utf8');
    expect(source.includes('fill_mileage')).toBe(false);
    expect(source.includes('tripOdometerRefusal(null, null)')).toBe(true);
  });
});
