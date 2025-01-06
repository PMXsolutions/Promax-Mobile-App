import { ShiftRosterType } from "./shift";

export interface ShiftReport {
  shiftReportId: number;
  urgentMatters: string;
  medicationGiven: string;
  medicationSigned: string;
  medicationAvailable: string;
  medicatioErrors: string;
  isMealManagementPlan: boolean;
  details_IfNotMealMaganagementPlan: string;
  isDrinkingProblem: boolean;
  details_IfProblemExist: string;
  isHealthIssues: boolean;
  details_IfHealthIssuesExist: string;
  goal_Progress: string;
  contactFamily: string;
  isIncident: boolean;
  details_IfIsIncipient: string;
  isBehaviourConcerned: boolean;
  details_ifIsBehaviourConcerned: string;
  shiftRosterId: number;
  shiftRoster: ShiftRosterType;
  companyID: number;
  dateCreated: Date;
  userCreated: string;
  dateModified: Date;
  userModified: string | null;
}
