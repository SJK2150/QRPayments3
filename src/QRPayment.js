import React, { useState } from "react";
import QRCodeGenerator from "./QRCodeGenerator";
import QRCodeReader from "./QRCodeReader";
import backgroundImage from "./background.png"; // Import your background image

const QRPayment = () => {
  const [mode, setMode] = useState(null);
  const contractAddress = "0xYourContractAddressHere"; // Replace with your contract address

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: "#0B062B",
        backgroundSize: "cover",
        backgroundPosition: "center",
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
          {/* Slider Section */}
          <div className="mb-16">
            <h2 className="text-[#32D8F9] text-xl font-medium mb-8 text-center">
              Quick Actions
            </h2>
            <div className="flex justify-center items-center">
              {/* Slider Container */}
              <div className="relative w-64 h-10 flex items-center justify-between bg-[#1A1A1A] rounded-full shadow-lg">
                {/* Left Button */}
                <button
                  onClick={() => setMode("pay")}
                  className={`w-1/2 text-center py-2 rounded-full ${
                    mode === "pay" ? "bg-[#32D8F9] text-white" : "bg-transparent text-[#d0cfd7]"
                  }`}
                >
                  Scan QR Code
                </button>
                {/* Right Button */}
                <button
                  onClick={() => setMode("receive")}
                  className={`w-1/2 text-center py-2 rounded-full ${
                    mode === "receive" ? "bg-[#32D8F9] text-white" : "bg-transparent text-[#d0cfd7]"
                  }`}
                >
                  Your QR Code
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {(mode === "pay" || mode === "receive") && (
            <div
              className="p-6 rounded-xl shadow-xl"
              style={{
                border: "3px solid #32D8F9",
                background: "rgba(50, 216, 249, 0.1)",
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
