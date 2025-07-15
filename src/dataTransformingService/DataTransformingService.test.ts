import { describe, it, expect } from "vitest";
import DataTransformingService from "./DataTransformingService";
import type { RequestData, UkTimeRefundRequest } from "../types";

// Sample request data for testing
const US_PST_REQUEST: RequestData = {
  name: "John Doe",
  customerLocation: "US (PST)",
  signUpDate: "02/01/2020", // February 1, 2020 - exactly on cutoff date
  requestSource: "phone",
  investmentDate: "02/04/2020", // February 4, 2020
  investmentTime: "21:30", // 9:30 PM PST = 5:30 AM GMT next day
  refundRequestDate: "03/05/2020", // March 5, 2020
  refundRequestTime: "19:00", // 7:00 PM PST = 3:00 AM GMT next day
};

const US_PST_REQUEST_EXPECTED: UkTimeRefundRequest = {
  ukSingUpDate: "01/02/2020", // DD/MM/YYYY format in UK
  ukInvestmentDate: "05/02/2020 05:30", // Converted to UK time, crosses to next day
  ukRefundRequestDate: "06/03/2020 03:00", // Converted to UK time, crosses to next day
  tosType: "nTOS", // Right on cutoff date, should be nTOS
  requestSource: "phone",
};

const EU_CET_REQUEST: RequestData = {
  name: "Jane Smith",
  customerLocation: "Europe (CET)",
  signUpDate: "10/10/2019", // October 10, 2019 - before cutoff date
  requestSource: "web app",
  investmentDate: "15/01/2022", // January 15, 2022 in European format (DD/MM/YYYY)
  investmentTime: "23:36", // 11:36 PM CET = 10:36 PM GMT (1 hour behind)
  refundRequestDate: "16/01/2022", // January 16, 2022 in European format
  refundRequestTime: "13:12", // 1:12 PM CET = 12:12 PM GMT (1 hour behind)
};

const EU_CET_REQUEST_EXPECTED: UkTimeRefundRequest = {
  ukSingUpDate: "10/10/2019", // Already in UK format
  ukInvestmentDate: "15/01/2022 22:36", // Converted from CET to GMT (-1 hour)
  ukRefundRequestDate: "16/01/2022 12:12", // Converted from CET to GMT (-1 hour)
  tosType: "oTOS", // Before cutoff date, should be oTOS
  requestSource: "web app",
};

const UK_GMT_REQUEST: RequestData = {
  name: "Emma Wilson",
  customerLocation: "Europe (GMT)",
  signUpDate: "15/03/2021", // March 15, 2021 - after cutoff date
  requestSource: "phone",
  investmentDate: "20/04/2021", // April 20, 2021
  investmentTime: "14:45", // 2:45 PM GMT = 2:45 PM UK (same timezone)
  refundRequestDate: "10/05/2021", // May 10, 2021
  refundRequestTime: "09:30", // 9:30 AM GMT = 9:30 AM UK (same timezone)
};

const UK_GMT_REQUEST_EXPECTED: UkTimeRefundRequest = {
  ukSingUpDate: "15/03/2021", // Already in UK format and timezone
  ukInvestmentDate: "20/04/2021 14:45", // No conversion needed, already UK time
  ukRefundRequestDate: "10/05/2021 09:30", // No conversion needed, already UK time
  tosType: "nTOS", // After cutoff date, should be nTOS
  requestSource: "phone",
};

// US PST Test Data - Morning/Day/Evening scenarios
const US_PST_MORNING: RequestData = {
  name: "Sarah Johnson",
  customerLocation: "US (PST)",
  signUpDate: "01/15/2021",
  requestSource: "phone",
  investmentDate: "02/20/2021",
  investmentTime: "08:00", // 8:00 AM PST = 4:00 PM GMT
  refundRequestDate: "02/21/2021",
  refundRequestTime: "09:30", // 9:30 AM PST = 5:30 PM GMT
};

const US_PST_MORNING_EXPECTED: UkTimeRefundRequest = {
  ukSingUpDate: "15/01/2021",
  ukInvestmentDate: "20/02/2021 16:00", // 8:00 AM PST = 4:00 PM GMT
  ukRefundRequestDate: "21/02/2021 17:30", // 9:30 AM PST = 5:30 PM GMT
  tosType: "nTOS",
  requestSource: "phone",
};

const US_PST_EVENING: RequestData = {
  name: "Michael Chen",
  customerLocation: "US (PST)",
  signUpDate: "03/20/2021",
  requestSource: "web app",
  investmentDate: "04/10/2021",
  investmentTime: "22:45", // 10:45 PM PST = 6:45 AM GMT next day
  refundRequestDate: "04/15/2021",
  refundRequestTime: "23:15", // 11:15 PM PST = 7:15 AM GMT next day
};

const US_PST_EVENING_EXPECTED: UkTimeRefundRequest = {
  ukSingUpDate: "20/03/2021",
  ukInvestmentDate: "11/04/2021 06:45", // Next day in UK
  ukRefundRequestDate: "16/04/2021 07:15", // Next day in UK
  tosType: "nTOS",
  requestSource: "web app",
};

// US PST - Edge case with TOS cutoff date
const US_PST_TOS_EDGE: RequestData = {
  name: "Linda Miller",
  customerLocation: "US (PST)",
  signUpDate: "01/02/2020", // Just before the 2/1/2020 cutoff
  requestSource: "phone",
  investmentDate: "02/05/2020",
  investmentTime: "14:30",
  refundRequestDate: "02/10/2020",
  refundRequestTime: "16:00",
};

const US_PST_TOS_EDGE_EXPECTED: UkTimeRefundRequest = {
  ukSingUpDate: "02/01/2020", // Just before cutoff
  ukInvestmentDate: "05/02/2020 22:30",
  ukRefundRequestDate: "11/02/2020 00:00", // Crosses day boundary
  tosType: "oTOS", // Should be old TOS since it's before cutoff
  requestSource: "phone",
};

// US PST - Date boundary crossing example
const US_PST_DATE_BOUNDARY: RequestData = {
  name: "Robert Taylor",
  customerLocation: "US (PST)",
  signUpDate: "12/31/2021",
  requestSource: "web app",
  investmentDate: "12/31/2021",
  investmentTime: "16:00", // 4:00 PM PST = 12:00 AM GMT next day (Jan 1)
  refundRequestDate: "01/01/2022",
  refundRequestTime: "00:01", // 12:01 AM PST = 8:01 AM GMT
};

const US_PST_DATE_BOUNDARY_EXPECTED: UkTimeRefundRequest = {
  ukSingUpDate: "31/12/2021",
  ukInvestmentDate: "01/01/2022 00:00", // Crosses to next year in UK
  ukRefundRequestDate: "01/01/2022 08:01",
  tosType: "nTOS",
  requestSource: "web app",
};

// Array of test cases as [request, expected] tuples
const TEST_CASES: [string, RequestData, UkTimeRefundRequest][] = [
  ["US PST standard case", US_PST_REQUEST, US_PST_REQUEST_EXPECTED],
  ["EU CET timezone conversion", EU_CET_REQUEST, EU_CET_REQUEST_EXPECTED],
  ["UK GMT no timezone conversion", UK_GMT_REQUEST, UK_GMT_REQUEST_EXPECTED],
  [
    "US PST morning hours (same day in UK)",
    US_PST_MORNING,
    US_PST_MORNING_EXPECTED,
  ],
  [
    "US PST evening hours (next day in UK)",
    US_PST_EVENING,
    US_PST_EVENING_EXPECTED,
  ],
  [
    "US PST with TOS cutoff edge case",
    US_PST_TOS_EDGE,
    US_PST_TOS_EDGE_EXPECTED,
  ],
  [
    "US PST with date boundary crossing",
    US_PST_DATE_BOUNDARY,
    US_PST_DATE_BOUNDARY_EXPECTED,
  ],
];

describe("DataTransformingService Integration Tests", () => {
  describe("throwing errors", () => {
    it("should throw an error if requestData is not provided", () => {
      // @ts-expect-error: Deliberately passing null to test error handling
      expect(() => DataTransformingService.transformRequestData(null)).toThrow(
        "RequestData is required"
      );
    });
  });

  describe("transformRequestData", () => {
    it.each(TEST_CASES)(
      "should correctly transform %s",
      (_, requestData, expected) => {
        const result =
          DataTransformingService.transformRequestData(requestData);

        const ukData = result.ukTimeRefundRequest;
        expect(ukData.ukSingUpDate).toBe(expected.ukSingUpDate);
        expect(ukData.ukInvestmentDate).toBe(expected.ukInvestmentDate);
        expect(ukData.ukRefundRequestDate).toBe(expected.ukRefundRequestDate);
        expect(ukData.tosType).toBe(expected.tosType);
        expect(ukData.requestSource).toBe(expected.requestSource);
      }
    );
  });
});
