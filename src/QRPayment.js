import React, { useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";
import QRCodeReader from "./QRCodeReader";
import backgroundImage from "./background.png"; // Import the image

const ActionButton = ({ label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`px-8 py-4 bg-blue-300 hover:bg-blue-400 
    rounded-xl transition-all duration-300 text-white font-semibold text-lg
    ${isActive ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/50" : ""}`}
  >
    {label}
  </button>
);

const QRPayment = () => {
  const [mode, setMode] = useState(null);
  const contractAddress = "0xYourContractAddressHere";

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${backgroundImage})`, // Use the imported image
        backgroundColor: "#0B062B", // Dark blue background color
        backgroundSize: "cover", // Ensures the image covers the whole screen
        backgroundPosition: "center", // Centers the background image
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-[#32D8F9]/70 rounded-b-lg shadow-md">
        <h1 className="text-2xl font-bold text-white">Vault-X</h1>
        <span className="text-white font-medium">ETHEREUM</span>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions Section */}
          <div className="mb-16">
            <h2 className="text-[#32D8F9] text-xl font-medium mb-8 text-center">
              Quick Actions
            </h2>
            <div className="flex justify-center gap-6">
              <ActionButton
                label="Pay"
                onClick={() => setMode("pay")}
                isActive={mode === "pay"}
              />
              <ActionButton
                label="Receive"
                onClick={() => setMode("receive")}
                isActive={mode === "receive"}
              />
            </div>
          </div>

          {/* QR Code Section */}
          {(mode === "pay" || mode === "receive") && (
            <div
              className="p-6 rounded-xl shadow-xl"
              style={{
                border: "3px solid #32D8F9", // Cyan blue border
                background: "rgba(50, 216, 249, 0.1)", // Light cyan background with opacity
              }}
            >
              <div className="text-center rounded-xl mb-6">
                <h3 className="text-xl font-semibold text-[#d0cfd7] mb-2">
                  {mode === "pay" ? "Scan QR to Pay" : "Receive Payment"}
                </h3>
              </div>
              {mode === "receive" && (
                <QRCodeGenerator contractAddress={contractAddress} />
              )}
              {mode === "pay" && (
                <QRCodeReader onScan={(data) => console.log(data)} />
              )}
            </div>
          )}

          {!mode && (
            <p className="text-center text-[#32D8F9] font-medium mt-8">
              Select an action above to proceed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRPayment;
