import { useState, useEffect } from "react";
import "./App.css";
import refundRequests from "../data/refundRequests.json";
import DataTransformingService from "./dataTransformingService/DataTransformingService";
import RefundValidationService from "./refundValidationService/RefundValidationService";

import type { EnhancedRequestData, RequestData } from "./types/index";

function App() {
  const [count, setCount] = useState(0);
  const [formattedData, setFormattedData] = useState<FormattedData[]>([]);

  useEffect(() => {
    const rawRefundRequests: RequestData[] = refundRequests;

    const transformedData: EnhancedRequestData[] = rawRefundRequests.map(
      (requestData: RequestData) =>
        DataTransformingService.transformRequestData(requestData)
    );

    const withRequestValidation = transformedData.map(
      (transformedData: EnhancedRequestData) => {
        RefundValidationService.validateRefundRequest(
          transformedData.ukTimeRefundRequest
        );
      }
    );
  }, []);

  return (
    <>
      {/* Display the formatted data */}
      <div className="data-container">
        <h2>Refund Requests (UK Time)</h2>
        {formattedData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Sign Up (UK)</th>
                <th>Investment (UK)</th>
                <th>Refund Request (UK)</th>
              </tr>
            </thead>
            <tbody>
              {formattedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.customerLocation}</td>
                  <td>{item.ukSingUpDate}</td>
                  <td>{item.ukInvestmentDate}</td>
                  <td>{item.ukRefundRequestDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading data...</p>
        )}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
