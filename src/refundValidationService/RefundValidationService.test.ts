import { describe, it, expect } from "vitest";
import RefundValidationService from "./RefundValidationService";
import type { UkTimeRefundRequest } from "../types";

// Sample refund request data for testing
const VALID_REFUND_REQUEST: UkTimeRefundRequest = {
  ukSingUpDate: "01/02/2020",
  ukInvestmentDate: "05/02/2020 14:30",
  ukRefundRequestDate: "06/02/2020 10:15",
  tosType: "nTOS",
  requestSource: "phone",
};

const EXPIRED_REFUND_REQUEST: UkTimeRefundRequest = {
  ukSingUpDate: "01/01/2020",
  ukInvestmentDate: "05/02/2020 14:30",
  ukRefundRequestDate: "15/03/2020 10:15", // Far beyond time limit
  tosType: "nTOS",
  requestSource: "phone",
};

const WEEKEND_REFUND_REQUEST: UkTimeRefundRequest = {
  ukSingUpDate: "01/02/2021",
  ukInvestmentDate: "14/02/2025 14:30",
  ukRefundRequestDate: "15/02/2025 10:15", // Assuming this is a weekend
  tosType: "nTOS",
  requestSource: "web app",
};

const FAILED_AFTER_HOURS_REFUND_REQUEST: UkTimeRefundRequest = {
  ukSingUpDate: "01/02/2020",
  ukInvestmentDate: "05/02/2025 14:30",
  ukRefundRequestDate: "06/02/2025 23:45", // After business hours
  tosType: "nTOS",
  requestSource: "phone",
};

const SUCCESSFUL_AFTER_HOURS_REFUND_REQUEST: UkTimeRefundRequest = {
  ukSingUpDate: "01/02/2022",
  ukInvestmentDate: "13/02/2025 10:30",
  ukRefundRequestDate: "13/02/2025 22:45", // After business hours
  tosType: "nTOS",
  requestSource: "phone",
};

const OLD_TOS_REFUND_REQUEST: UkTimeRefundRequest = {
  ukSingUpDate: "01/01/2020",
  ukInvestmentDate: "06/01/2025 10:30",
  ukRefundRequestDate: "06/01/2025 14:20",
  tosType: "oTOS", // Old terms of service
  requestSource: "phone",
};

const WEB_APP_REFUND_REQUEST: UkTimeRefundRequest = {
  ukSingUpDate: "01/02/2021",
  ukInvestmentDate: "05/02/2021 14:30",
  ukRefundRequestDate: "06/02/2021 06:30", // Request made on the limit
  tosType: "nTOS",
  requestSource: "web app",
};

// Array of test cases as [description, request, expectedResult] tuples
const VALIDATION_TEST_CASES: [string, UkTimeRefundRequest, boolean][] = [
  ["valid phone request within time limit", VALID_REFUND_REQUEST, true],
  ["expired request outside time limit", EXPIRED_REFUND_REQUEST, false],
  ["weekend request outside business days", WEEKEND_REFUND_REQUEST, false],
  [
    "failed after-hours request outside business hours",
    FAILED_AFTER_HOURS_REFUND_REQUEST,
    false,
  ],
  [
    "successful after-hours request outside business hours",
    SUCCESSFUL_AFTER_HOURS_REFUND_REQUEST,
    true,
  ],
  ["old TOS request with different time limit", OLD_TOS_REFUND_REQUEST, true],
  ["web app request with different time limit", WEB_APP_REFUND_REQUEST, true],

  ["old TOS request with different time limit", OLD_TOS_REFUND_REQUEST, true],
  ["web app request with different time limit", WEB_APP_REFUND_REQUEST, true],
];

describe("RefundValidationService Tests", () => {
  describe("throwing errors", () => {
    it("should throw an error if requestData is not provided", () => {
      expect(() =>
        // @ts-expect-error: Deliberately passing null to test error handling
        RefundValidationService.validateRefundRequest(null)
      ).toThrow();
    });
  });

  describe("validateRefundRequest", () => {
    it.each(VALIDATION_TEST_CASES)("should %s", (_, request, expected) => {
      const result = RefundValidationService.validateRefundRequest(request);
      expect(result.isRequestValid).toBe(expected);
    });
  });
});
