import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timeLimits from "../../data/timeLimits.json";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import type {
  UkTimeRefundRequest,
  TimeLimits,
  TOSType,
  RequestSource,
  TimeLimitEntry,
} from "../types";

dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

export default class RefundValidationService {
  static #weekendDays: number[] = [0, 6]; // In DayJs these represent [Sunday, Saturday]
  static #weekDays: number[] = [1, 2, 3, 4, 5]; // In DayJs these represent [Monday, Tuesday, Wednesday, Thursday, Friday]
  static #openingTimes: number = 9;
  static #closingTimes: number = 17;
  static #timeLimits: TimeLimits = timeLimits;

  static validateRefundRequest(requestData: UkTimeRefundRequest): boolean {
    try {
      // Very limited validation to ensure requestData is provided
      // Should be expanded in a real-world scenario
      if (!requestData) {
        throw new Error("requestData is required");
      }

      // Determine when the request was registered based on the request source
      const registeredRequestTime: string =
        this.#getRequestRegisteredTime(requestData);

      // Get cutoff for the refund request for the given investment
      const requestCutoffDate: dayjs.Dayjs =
        this.#getRequestCutoffDate(requestData);

      // Validate the request
      const isRequestValid: boolean = this.#validateRequest(
        registeredRequestTime,
        requestCutoffDate
      );

      return isRequestValid;
    } catch (error) {
      // Handle the error gracefully
      if (error instanceof Error) {
        throw new Error(`Refund validation failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred during validation");
      }
    }
  }

  /**
   * Determines the registered time for a refund request based on the request source.
   * For web app requests, it uses the refund request date.
   * For phone requests, it checks if the request is made during business hours and returns the appropriate time.
   */
  static #getRequestRegisteredTime(requestData: UkTimeRefundRequest): string {
    if (requestData.requestSource === "web app") {
      return requestData.ukRefundRequestDate;
    }

    const refundDate = dayjs(
      requestData.ukRefundRequestDate,
      "DD/MM/YYYY HH:mm"
    );

    const isWeekend = this.#weekendDays.includes(refundDate.day());
    const isBeforeOpeningTime = refundDate.hour() < this.#openingTimes;
    const isAfterClosingTime = refundDate.hour() >= this.#closingTimes;

    const isValidPhoneTime =
      !isWeekend && !isBeforeOpeningTime && !isAfterClosingTime;

    if (isValidPhoneTime) {
      return requestData.ukRefundRequestDate;
    }

    return this.#findNextAvailableTime(
      refundDate,
      isWeekend,
      isBeforeOpeningTime
    );
  }

  /**
   * Finds the next available time for a refund request.
   * If the request is made before opening hours, it sets the time to the opening time of the same day.
   * If the request is made on a weekend or after closing hours, it finds the next available weekday and sets the time to the opening time of that day.
   */
  static #findNextAvailableTime(
    refundRequestDate: dayjs.Dayjs,
    isWeekend: boolean,
    isBeforeOpeningTime: boolean
  ): string {
    let firstAvailableTime: dayjs.Dayjs;

    if (!isWeekend && isBeforeOpeningTime) {
      //  Set the first available time to the opening time of the same day
      firstAvailableTime = refundRequestDate
        .hour(this.#openingTimes)
        .minute(0)
        .second(0);
    } else {
      // Find first non-weekend day and set the time to opening time
      let nextDay = refundRequestDate.add(1, "day").startOf("day");

      while (!this.#weekDays.includes(nextDay.day())) {
        nextDay = nextDay.add(1, "day");
      }
      firstAvailableTime = nextDay.hour(this.#openingTimes).minute(0).second(0);
    }

    return firstAvailableTime.format("DD/MM/YYYY HH:mm");
  }

  /**
   * Calculates the cutoff date for a refund request based on the terms of service type and request source.
   * The cutoff date is determined by the investment date and the time limit defined in the time limits configuration.
   */
  static #getRequestCutoffDate(requestData: UkTimeRefundRequest): dayjs.Dayjs {
    const timeLimit = this.#getTimeLimit(
      requestData.tosType,
      requestData.requestSource
    );

    const investmentDate = dayjs(
      requestData.ukInvestmentDate,
      "DD/MM/YYYY HH:mm"
    );
    return investmentDate.add(timeLimit, "hour");
  }

  /**
   * Validates if the refund request is within the allowed time frame.
   */
  static #validateRequest(
    registeredRequestTime: string,
    cutoffDate: dayjs.Dayjs
  ): boolean {
    const requestDate = dayjs(registeredRequestTime, "DD/MM/YYYY HH:mm");
    return requestDate.isSameOrBefore(cutoffDate, "minute");
  }

  /**
   * Determines the time limit for a refund request based on the terms of service type and request source.
   */
  static #getTimeLimit(tosType: TOSType, requestSource: RequestSource): number {
    const timeLimitEntry: TimeLimitEntry = this.#timeLimits[requestSource];
    return timeLimitEntry[tosType];
  }
}
