import { useState, useEffect } from "react";
import "./App.css";
import refundRequests from "../data/refundRequests.json";
import DataTransformingService from "./dataTransformingService/DataTransformingService";
import RefundValidationService from "./refundValidationService/RefundValidationService";
import ValidationData from "./components/ValidationData";

import { Tooltip } from "react-tooltip";

import type {
  EnhancedRequestData,
  RequestData,
  RequestDataWithValidation,
} from "./types/index";

const getRequestsWithValidation = (): RequestDataWithValidation[] => {
  const rawRefundRequests: RequestData[] = refundRequests;

  const transformedData: EnhancedRequestData[] = rawRefundRequests.map(
    (requestData: RequestData) =>
      DataTransformingService.transformRequestData(requestData)
  );

  return transformedData.map((transformedData: EnhancedRequestData) => {
    const validation = RefundValidationService.validateRefundRequest(
      transformedData.ukTimeRefundRequest
    );

    return {
      ...transformedData,
      validation,
    };
  });
};

function App() {
  const [formattedData, setFormattedData] = useState<
    RequestDataWithValidation[]
  >([]);

  useEffect(() => {
    const requestsWithValidation = getRequestsWithValidation();
    setFormattedData(requestsWithValidation);
  }, []);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Refund Requests Dashboard</h1>
        </header>

        <div className="table-container">
          {formattedData.length > 0 ? (
            <table className="refund-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Sign-up Date</th>
                  <th>Request Source</th>
                  <th>Investment</th>
                  <th>Refund Request</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {formattedData.map((item, index) => (
                  <tr key={index}>
                    <td className="customer-name">{item.name}</td>
                    <td>
                      <span className="location-badge">
                        {item.customerLocation}
                      </span>
                    </td>
                    <td>{item.signUpDate}</td>
                    <td>
                      <span
                        className={`source-badge ${item.requestSource.replace(
                          " ",
                          "-"
                        )}`}
                      >
                        {item.requestSource}
                      </span>
                    </td>
                    <td>
                      <div className="datetime-group">
                        <div className="date">{item.investmentDate}</div>
                        <div className="time">{item.investmentTime}</div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-group">
                        <div className="date">{item.refundRequestDate}</div>
                        <div className="time">{item.refundRequestTime}</div>
                      </div>
                    </td>
                    <td data-tooltip-id={`tooltip-${index}`}>
                      <span
                        className={`status-badge ${
                          item.validation.isRequestValid ? "valid" : "invalid"
                        }`}
                      >
                        {item.validation.isRequestValid ? "Valid" : "Invalid"}
                      </span>
                      <Tooltip
                        id={`tooltip-${index}`}
                        className="tooltip"
                        style={{
                          maxWidth: "400px",
                          background: "#333",
                          opacity: 1,
                        }}
                        place="left"
                      >
                        <ValidationData
                          data={item.validation.validationReason}
                        />
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading refund requests...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
