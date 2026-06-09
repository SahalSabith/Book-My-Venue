import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";

import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";


const App = () => {

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>}/>

        <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>}/>

        <Route path="/forgot-password" element={<PublicRoute> <ForgotPassword /> </PublicRoute>}/>

        <Route path="/" element={<ProtectedRoute> <Home /> </ProtectedRoute>}/>

      </Routes>
    </BrowserRouter>
  );
};


export default App;