import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import timeLimits from "../../data/timeLimits.json";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

import type { UkTimeRefundRequest, TimeLimits } from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export default class RefundValidationService {
  static #weekendDays: number[] = [0, 6]; // In DayJs these represent [Sunday, Saturday]
  static #weekDays: number[] = [1, 2, 3, 4, 5]; // In DayJs these represent [Monday, Tuesday, Wednesday, Thursday, Friday]
  static #openingTimes: number = 9;
  static #closingTimes: number = 17;
  static #timeLimits: TimeLimits = timeLimits;

  static validateRefundRequest(requestsData: UkTimeRefundRequest): boolean {
    const registeredRequestTime: string =
      this.#getRequestRegisteredTime(requestsData);
  }

  static #getRequestRegisteredTime(requestsData: UkTimeRefundRequest): string {
    if (requestsData.requestSource === "web app") {
      return requestsData.ukRefundRequestDate;
    }

    const refundDate = dayjs(
      requestsData.ukRefundRequestDate,
      "DD/MM/YYYY HH:mm"
    );

    const isWeekend = this.#weekendDays.includes(refundDate.day());
    const isBeforeOpeningTime = refundDate.hour() < this.#openingTimes;
    const isAfterClosingTime = refundDate.hour() >= this.#closingTimes;

    const isValidPhoneTime =
      !isWeekend && !isBeforeOpeningTime && !isAfterClosingTime;

    if (isValidPhoneTime) {
      return requestsData.ukRefundRequestDate;
    }

    return this.#findNextAvailableTime(
      refundDate,
      isWeekend,
      isBeforeOpeningTime
    );
  }

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
}
