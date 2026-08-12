export const ATTENDANCE_GEOFENCE_RADIUS_METERS = 1000;

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const canSubmitAttendanceOnline = (
  isConnected: boolean | null
): boolean => isConnected === true;
