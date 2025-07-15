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

export interface FormattedData {
  name: string;
  ukSingUpDate: string;
  ukInvestmentDate: string;
  ukRefundRequestDate: string;
  tosType: "oTOS" | "nTOS";
}
