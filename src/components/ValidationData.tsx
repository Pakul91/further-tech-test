import React from "react";
import type { ValidationData as ValidationDataType } from "../types";
import "./ValidationData.css";

interface ValidationDataProps {
  data: ValidationDataType;
}

const ValidationData: React.FC<ValidationDataProps> = ({ data }) => {
  const isValid = data.isRequestValid === "valid";
  const statusClass = isValid
    ? "validation-status-valid"
    : "validation-status-invalid";

  return (
    <div className="validation-data">
      <h3 className={`validation-status ${statusClass}`}>
        Refund Request is {data.isRequestValid}
      </h3>

      <div className="validation-group">
        <h4>Investment Details</h4>
        <div className="validation-item">
          <strong>Date:</strong> {data.investmentDate} (
          {data.investmentDayOfWeek})
        </div>
        <div className="validation-item">
          <strong>TOS Type:</strong>{" "}
          {data.tosType === "oTOS" ? "Old TOS" : "New TOS"}
        </div>
      </div>

      <div className="validation-group">
        <h4>Request Timeline</h4>
        <div className="validation-item">
          <strong>Request Made:</strong> {data.requestMadeTime} (
          {data.requestMadeDayOfWeek})
        </div>
        <div className="validation-item">
          <strong>Registered Time:</strong> {data.registeredRequestTime} (
          {data.registeredRequestDayOfWeek})
        </div>
        <div className="validation-item">
          <strong>Cutoff:</strong> {data.requestCutoffDate} (
          {data.requestCutoffDayOfWeek})
        </div>
      </div>

      <div className="validation-group">
        <h4>Time Limit</h4>
        <div className="validation-item">
          <strong>Hours:</strong> {data.timeLimit} hour
          {data.timeLimit !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

export default ValidationData;
