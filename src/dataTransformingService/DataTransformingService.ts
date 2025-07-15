import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import timeZoneMappings from "../../data/timeZoneMapping.json";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

import type {
  TimeZoneMapping,
  TimeZoneInfo,
  RequestData,
  RequestSource,
  UkTimeRefundRequest,
  EnhancedRequestData,
  TOSType,
} from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export default class DataTransformingService {
  // Cutoff date for determining which Terms of Service applies to the customer
  static #oTOScutoff: string = "2/1/2020";

  /**
   * Transforms the raw request data into enhanced data with standardized UK time format.
   * Converts dates from customer's local timezone to UK time and determines the applicable Terms of Service.
   */
  static transformRequestData(requestData: RequestData): EnhancedRequestData {
    if (!requestData) {
      throw new Error("RequestData is required");
    }

    const {
      ukSingUpDate,
      ukInvestmentDate,
      ukRefundRequestDate,
    }: {
      ukSingUpDate: string;
      ukInvestmentDate: string;
      ukRefundRequestDate: string;
    } = this.#convertDates(requestData);

    const tosType = this.#addTOStype(ukSingUpDate);

    const ukTimeRefundRequest: UkTimeRefundRequest = {
      ukSingUpDate,
      ukInvestmentDate,
      ukRefundRequestDate,
      tosType,
      requestSource: requestData.requestSource as RequestSource,
    };

    return {
      ...requestData,
      ukTimeRefundRequest,
    };
  }

  /**
   * Converts customer's local date/time values to UK time format.
   * Retrieves timezone information based on customer location and handles the conversion.
   */
  static #convertDates(requestData: RequestData) {
    const customerTimezoneInfo: TimeZoneInfo = this.#getTimezoneInfo(
      requestData.customerLocation
    );

    const ukSingUpDate: string = this.#convertToUkTime(
      requestData.signUpDate,
      customerTimezoneInfo
    );

    const ukInvestmentDate: string = this.#convertToUkTime(
      requestData.investmentDate,
      customerTimezoneInfo,
      requestData.investmentTime
    );

    const ukRefundRequestDate: string = this.#convertToUkTime(
      requestData.refundRequestDate,
      customerTimezoneInfo,
      requestData.refundRequestTime
    );

    return {
      ukSingUpDate,
      ukInvestmentDate,
      ukRefundRequestDate,
    };
  }

  /**
   * Converts a date from a source timezone to UK time (Europe/London).
   * Handles both date-only and date-time conversions using the appropriate format.
   * Returns the formatted date string in UK format.
   */
  static #convertToUkTime(
    date: string,
    timezoneInfo: TimeZoneInfo,
    time?: string
  ): string {
    const hasTime = !!time;

    if (!hasTime) {
      return dayjs(date, timezoneInfo.dateFormat).format("DD/MM/YYYY");
    }

    const sourceDate: string = `${date} ${time}`;
    const sourceFormat: string = `${timezoneInfo.dateFormat} HH:mm`;
    const targetFormat: string = "DD/MM/YYYY HH:mm";

    const formattedDate: string = dayjs
      .tz(sourceDate, sourceFormat, timezoneInfo.timezone)
      .tz("Europe/London")
      .format(targetFormat);

    return formattedDate;
  }

  /**
   * Retrieves timezone information for a given customer location from the timezone mappings.
   */
  static #getTimezoneInfo(timezoneName: string) {
    const mappings: TimeZoneMapping = timeZoneMappings;
    return mappings[timezoneName];
  }

  /**
   * Determines which Terms of Service type applies to the customer based on their sign-up date.
   * Returns 'nTOS' for new Terms of Service if sign-up is after the cutoff date, otherwise 'oTOS'.
   */
  static #addTOStype(signUpDate: string): TOSType {
    const oldTosCutoffDate: dayjs.Dayjs = dayjs(this.#oTOScutoff, "D/M/YYYY");
    const signUpDayjs: dayjs.Dayjs = dayjs(signUpDate, "DD/MM/YYYY");
    const isAfter: boolean = signUpDayjs.isAfter(oldTosCutoffDate);

    return isAfter ? "nTOS" : "oTOS";
  }
}
