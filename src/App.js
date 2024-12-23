import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRPayment from "./QRPayment";


const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Route for QR Payment */}
          <Route path="/qrpayments" element={<QRPayment />} />
          
          
          
          {/* Route for About Page */}
          <Route
            path="/about"
            element={
              <div>
                <h2>About Page</h2>
                <p>Details about the QR Payment feature will go here.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
