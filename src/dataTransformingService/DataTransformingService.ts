import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import timeZoneMappings from "../../data/timeZoneMapping.json";

interface RequestData {
  name: string;
  customerLocation: string;
  signUpDate: string;
  requestSource: string;
  investmentDate: string;
  investmentTime: string;
  refundRequestDate: string;
  refundRequestTime: string;
}

interface FormattedData {
  name: string;
  customerLocation: string;
  ukSingUpDate: string;
  ukInvestmentDate: string;
  ukRefundRequestDate: string;
}

dayjs.extend(utc);
dayjs.extend(timezone);

export default class DataTransformingService {
  static transformRequestData(requestsData: RequestData[]): FormattedData[] {
    if (!Array.isArray(requestsData)) {
      throw new TypeError("Requests data needs to be an array!");
    }

    console.log("requestsData", requestsData);

    return requestsData.map((request) => ({
      name: request.name,
      customerLocation: request.customerLocation,
      ukSingUpDate: request.signUpDate,
      ukInvestmentDate: `${request.investmentDate} ${request.investmentTime}`,
      ukRefundRequestDate: `${request.refundRequestDate} ${request.refundRequestTime}`,
    }));
  }

  static #convertToUkTime() {}

  static #addTOCtype();
}
