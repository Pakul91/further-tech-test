import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import timeZoneMappings from "../../data/timeZoneMapping.json";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

import type {
  TimeZoneMapping,
  TimeZoneInfo,
  RequestData,
  FormattedData,
} from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export default class DataTransformingService {
  static #oTOScutoff: string = "2/1/2020";

  static transformRequestData(requestsData: RequestData[]): FormattedData[] {
    if (!Array.isArray(requestsData)) {
      throw new TypeError("Requests data needs to be an array!");
    }

    const formattedData = requestsData.reduce(
      (acc: FormattedData[], request: RequestData): FormattedData[] => {
        const customerTimezoneInfo: TimeZoneInfo = this.#getTimezoneInfo(
          request.customerLocation
        );

        const ukSingUpDate: string = this.#convertToUkTime(
          request.signUpDate,
          customerTimezoneInfo
        );

        const ukInvestmentDate: string = this.#convertToUkTime(
          request.investmentDate,
          customerTimezoneInfo,
          request.investmentTime
        );

        const ukRefundRequestDate: string = this.#convertToUkTime(
          request.refundRequestDate,
          customerTimezoneInfo,
          request.refundRequestTime
        );

        const tosType = this.#addTOStype(ukSingUpDate);

        const data = {
          name: request.name,
          ukSingUpDate,
          ukInvestmentDate,
          ukRefundRequestDate,
          tosType,
        };

        acc.push(data);
        return acc;
      },
      []
    );

    return formattedData;
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

    //check withing time. Between, sameafter, samebofer,
    //check delta time use differnce/or check latest time

    // const localTime = dayjs.tz(dateTime, format, timezone);

    // Convert to UK time (Europe/London)
    // return localTime.tz("Europe/London").format("YYYY-MM-DD HH:mm:ss");
  }

  static #getTimezoneInfo(timezoneName: string) {
    const mappings: TimeZoneMapping = timeZoneMappings;
    return mappings[timezoneName];
  }

  static #addTOStype(signUpDate: string): "oTOS" | "nTOS" {
    const oldTosCutoffDate = dayjs(this.#oTOScutoff, "D/M/YYYY");
    const signUpDayjs = dayjs(signUpDate, "DD/MM/YYYY");
    const isAfter = signUpDayjs.isAfter(oldTosCutoffDate);

    return isAfter ? "nTOS" : "oTOS";
  }
}
