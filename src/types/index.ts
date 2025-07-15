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
}

export interface EnhancedRequestData extends RequestData {
  ukTimeRefundRequest: UkTimeRefundRequest;
}

export type TOSType = "oTOS" | "nTOS";
export type RequestSource = "phone" | "web app";

export interface TimeLimitEntry {
  oTOS: number;
  nTOS: number;
}

export type TimeLimits = {
  [K in RequestSource]: TimeLimitEntry;
};
