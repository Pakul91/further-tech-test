export interface TimeZoneInfo {
  timezone: string;
  dateFormat: string;
}

export interface TimeZoneMapping {
  [key: string]: TimeZoneInfo;
}

export interface RequestData {
  name: string;
  customerLocation: string;
  signUpDate: string;
  requestSource: string;
  investmentDate: string;
  investmentTime: string;
  refundRequestDate: string;
  refundRequestTime: string;
}

export interface UkTimeRefundRequest {
  ukSingUpDate: string;
  ukInvestmentDate: string;
  ukRefundRequestDate: string;
  tosType: TOSType;
  requestSource: RequestSource;
}

export interface EnhancedRequestData extends RequestData {
  ukTimeRefundRequest: UkTimeRefundRequest;
}

export interface RequestDataWithValidation extends EnhancedRequestData {
  validation: RefundValidationResult;
}

export type TOSType = "oTOS" | "nTOS";

export type RequestSource = "phone" | "web app";

export type TimeLimitEntry = {
  [K in TOSType]: number;
};

export type TimeLimits = {
  [K in RequestSource]: TimeLimitEntry;
};

export interface RefundValidationResult {
  isRequestValid: boolean;
  validationReason: ValidationData;
}

export interface DayOfWeekMapping {
  [key: number]: string;
}

export interface ValidationData {
  investmentDate: string;
  investmentDayOfWeek: string;
  requestMadeTime: string;
  requestMadeDayOfWeek: string;
  registeredRequestTime: string;
  registeredRequestDayOfWeek: string;
  requestCutoffDate: string;
  requestCutoffDayOfWeek: string;
  isRequestValid: string;
  timeLimit: number;
  tosType: TOSType;
}
