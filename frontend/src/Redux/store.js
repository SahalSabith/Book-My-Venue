import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slice/authSlice";
import venueReducer from "./Slice/venueSlice"
import bookingReducer from './Slice/bookingSlice'


export const store = configureStore({

  reducer: {
    auth: authReducer,
    venue: venueReducer,
    bookings: bookingReducer
  }

});