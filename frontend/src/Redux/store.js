import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slice/authSlice";
import venueReducer from "./Slice/venueSlice"
import bookingReducer from './Slice/venueSlice'


export const store = configureStore({

  reducer: {
    auth: authReducer,
    venue: venueReducer,
    booking: bookingReducer
  }

});