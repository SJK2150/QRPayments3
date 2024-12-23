import React, { useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";
import QRCodeReader from "./QRCodeReader";

const QRPayment = () => {
  const [mode, setMode] = useState(null);
  const contractAddress = "0xYourContractAddressHere";

  return (
    <div className="app-container">
      <h2 className="text-center text-2xl font-bold py-4">QR Payment</h2>
      <div className="flex justify-center gap-4 mb-4">
        <button onClick={() => setMode("receive")} className="btn">
          Receive Payment
        </button>
        <button onClick={() => setMode("pay")} className="btn">
          Pay
        </button>
      </div>

      {mode === "receive" && <QRCodeGenerator contractAddress={contractAddress} />}
      {mode === "pay" && <QRCodeReader onScan={(data) => console.log(data)} />}
      {!mode && <p className="text-center">Select a mode to proceed.</p>}
    </div>
  );
};

export default QRPayment;
