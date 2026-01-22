import React from "react";

const PaymentSection = ({ price, isRTL }) => {
  return (
    <div className="payment-section">
      <div className="text-xl font-bold">{price ? `${price} USD` : "Price unavailable"}</div>
      <button className="btn btn-primary mt-2">Proceed to Pay</button>
    </div>
  );
};

export default PaymentSection;
