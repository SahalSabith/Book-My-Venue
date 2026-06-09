import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";
import VenueOwner from "./Pages/VenueOwner";

import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import OwnerRoute from "./Components/OwnerRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — redirect away if already logged in */}
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Main app — accessible to anyone, header handles login state */}
        <Route path="/" element={<Home />} />

        {/* Owner-only dashboard */}
        <Route path="/venue-owner" element={<OwnerRoute><VenueOwner /></OwnerRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;