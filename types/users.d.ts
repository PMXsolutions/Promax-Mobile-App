import { StaffProfileTypes } from "./auth";

export interface StaffInfoType {
  staffId: number;
  maxStaffId: string;
  firstName: string;
  surName: string;
  middleName: string | null;
  aboutMe: string | null;
  address: string;
  postcode: string | null;
  email: string;
  employeeId: string;
  phoneNumber: string;
  profession: string | null;
  gender: string;
  imageUrl: string | null;
  imageFile: string | null;
  country: string;
  state: string;
  city: string;
  auditApproved: boolean;
  isCompleted: boolean;
  isActive: boolean;
  dateOfBirth: string; // You may want to use Date type if it's a date string
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  linkedIn: string | null;
  github: string | null;
  employmentType: string | null;
  taxFile: string | null;
  position: string | null;
  australianCitizen: boolean | null;
  dateJoined: string | null; // You may want to use Date type if it's a date string
  salary: number;
  payDay: number;
  payRate: string;
  bankName: string;
  bsb: string;
  branch: string;
  accountName: string;
  accountNumber: string;
  nextOfKin: string;
  relationship: string;
  kinPostcode: string;
  kinAddress: string;
  kinCountry: string;
  kinCity: string;
  kinEmail: string;
  suburb: string;
  kinState: string;
  kinPhoneNumber: string;
  isDocumentUploaded: boolean;
  isAdmin: boolean;
  adm_DesignationsId: number;
  adm_Designations: string | null; // You may want to define a type for this
  offerLetter: string | null;
  handbook: string | null;
  superForm: string | null;
  supportPosition: string | null;
  fullName: string;
  dateCreated: string; // You may want to use Date type if it's a date string
  userCreated: string;
  dateModified: string; // You may want to use Date type if it's a date string
  userModified: string;
  signatureUrl: string | null;
  signatureFile: string | null;
}
export interface ClientInfoType {
  profileId: number;
  firstName: string;
  surName: string;
  middleName: string;
  clientId: number;
  careManager: string;
  contactId: string;
  address: string;
  email: string;
  phoneNumber: string;
  gender: string;
  imageUrl: string;
  auditApproved: boolean;
  imageFile: string | null;
  country: string;
  state: string;
  city: string;
  isCompleted: boolean;
  isActive: boolean;
  kinSuburb: string;
  dateOfBirth: string; // You may want to use Date type if it's a date string
  homePhone: string | null;
  workPhone: string | null;
  profession: string | null;
  culturalBackground: string;
  preferredLanguage: string;
  requireInterpreter: boolean;
  indigenousSatatus: string;
  ndisPlan: string;
  ndisPlanNote: string;
  privacyPreferences: string;
  financialArrangement: string;
  ndisNo: string;
  agreementStartDate: string; // You may want to use Date type if it's a date string
  agreementEndDate: string; // You may want to use Date type if it's a date string
  nextOfKin: string | null;
  relationship: string | null;
  kinPostcode: string | null;
  kinAddress: string | null;
  kinCountry: string | null;
  kinCity: string | null;
  kinEmail: string | null;
  latitude: number;
  longitude: number;
  suburb: string | null;
  kinState: string | null;
  kinPhoneNumber: string | null;
  signature: string | null;
  signatureFile: string | null;
  fullName: string;
  dateCreated: string; // You may want to use Date type if it's a date string
  userCreated: string;
  dateModified: string; // You may want to use Date type if it's a date string
  userModified: string;
}

export interface StaffAvailability {
  companyID: number;
  dateCreated: string;
  dateModified: string;
  days: string;
  fromTimeOfDay: string;
  staffAvailibilityId: number;
  staffId: number;
  toTimeOfDay: string;
  userCreated: string;
  userModified: string;
  staff: StaffProfileTypes;
}
