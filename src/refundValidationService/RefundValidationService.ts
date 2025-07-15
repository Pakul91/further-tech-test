import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import timeLimits from "../../data/timeZoneMapping.json";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

import type {
  TimeZoneMapping,
  TimeZoneInfo,
  RequestData,
  UkTimeRefundRequest,
  EnhancedRequestData,
} from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export default class RefundValidationService {
  static #openingTimes = 9;
  static #closingTimes = 17;

  static validateRefundRequest(requestsData: UkTimeRefundRequest): boolean {}
}
