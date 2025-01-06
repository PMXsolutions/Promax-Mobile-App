import { ClientInfoType, StaffInfoType } from "./users";

export interface ShiftRosterType {
  shiftRosterId: number;
  staffId: number;
  reportId: number;
  staff: StaffInfoType;
  dateFrom: Date;
  dateTo: Date;
  activities: string;
  profileId: number;
  profile: ClientInfoType;
  reason: string;
  clients: string;
  status: string;
  appointment: string | null;
  attendance: boolean;
  requestCancellation: boolean;
  isNightShift: boolean;
  isCurrent: boolean;
  isEnded: boolean;
  isExceptionalShift: boolean;
  isShiftReportSigned: boolean;
  repeat: boolean;
  attendId: number;
  companyID: number;
  dateCreated: Date;
  userCreated: string | null;
  dateModified: string | Date;
  userModified: string | null;
}
export interface AgendaProps {
  shiftRosterId: number;
  staff?: string;
  staffFirstName?: string;
  staffLastName?: string;
  staffImage?: string;
  client?: string;
  activities?: string;
  dateFrom: Date;
  dateTo: Date;
  status: string;
  isEnded: boolean;
  attendance: boolean;
  image?: string;
}
