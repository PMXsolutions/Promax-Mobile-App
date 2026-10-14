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
});
