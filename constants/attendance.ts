export const ATTENDANCE_GEOFENCE_RADIUS_METERS = 1000;

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
