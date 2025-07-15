import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import refundRequests from "../data/refundRequests.json";
import DataTransformingService from "./dataTransformingService/DataTransformingService";

// Define the interface for formatted data
interface FormattedData {
  name: string;
  customerLocation: string;
  ukSingUpDate: string;
  ukInvestmentDate: string;
  ukRefundRequestDate: string;
}

function App() {
  const [count, setCount] = useState(0);
  const [formattedData, setFormattedData] = useState<FormattedData[]>([]);

  useEffect(() => {
    try {
      const transformedData =
        DataTransformingService.transformRequestData(refundRequests);
      setFormattedData(transformedData);
    } catch (error) {
      console.error("Error transforming request data:", error);
    }
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

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
