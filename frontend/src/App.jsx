import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Login from './Pages/Login'
import Register from './Pages/Register'
import ForgotPassword from './Pages/ForgotPassword'
import Home from './Pages/Home'

const App = () => {
  return (
    <BrowserRouter>
    <Routes>

      <Route
      path="/register"
      element={<Register/>}
      />

      <Route
      path="/login"
      element={<Login/>}
      />

      <Route
      path="/forgot-password"
      element={<ForgotPassword/>}
      />

      <Route
      path="/"
      element={<Home/>}
      />

    </Routes>
    </BrowserRouter>
  )
}

export default App