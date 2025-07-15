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
  static #oTOScutoff: string = "2/1/2020";

  static transformRequestData(requestsData: RequestData): EnhancedRequestData {
    const customerTimezoneInfo: TimeZoneInfo = this.#getTimezoneInfo(
      requestsData.customerLocation
    );

    const ukSingUpDate: string = this.#convertToUkTime(
      requestsData.signUpDate,
      customerTimezoneInfo
    );

    const ukInvestmentDate: string = this.#convertToUkTime(
      requestsData.investmentDate,
      customerTimezoneInfo,
      requestsData.investmentTime
    );

    const ukRefundRequestDate: string = this.#convertToUkTime(
      requestsData.refundRequestDate,
      customerTimezoneInfo,
      requestsData.refundRequestTime
    );

    const tosType = this.#addTOStype(ukSingUpDate);

    const ukTimeRefundRequest: UkTimeRefundRequest = {
      ukSingUpDate,
      ukInvestmentDate,
      ukRefundRequestDate,
      tosType,
      requestSource: requestsData.requestSource as RequestSource,
    };

    return {
      ...requestsData,
      ukTimeRefundRequest,
    };
  }

  static #convertToUkTime(
    date: string,
    timezoneInfo: TimeZoneInfo,
    time?: string
  ): string {
    const hasTime = !!time;

    if (!hasTime) {
      return dayjs(date, timezoneInfo.dateFormat).format("DD/MM/YYYY");
    }

    const sourceDate = `${date} ${time}`;
    const sourceFormat = `${timezoneInfo.dateFormat} HH:mm`;
    const targetFormat = "DD/MM/YYYY HH:mm";

    const formattedDate = dayjs
      .tz(sourceDate, sourceFormat, timezoneInfo.timezone)
      .tz("Europe/London")
      .format(targetFormat);

    return formattedDate;
  }

  static #getTimezoneInfo(timezoneName: string) {
    const mappings: TimeZoneMapping = timeZoneMappings;
    return mappings[timezoneName];
  }

  static #addTOStype(signUpDate: string): TOSType {
    const oldTosCutoffDate = dayjs(this.#oTOScutoff, "D/M/YYYY");
    const signUpDayjs = dayjs(signUpDate, "DD/MM/YYYY");
    const isAfter = signUpDayjs.isAfter(oldTosCutoffDate);

    return isAfter ? "nTOS" : "oTOS";
  }
}
