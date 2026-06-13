import { createSlice, createAsyncThunk, isPending, isRejected } from "@reduxjs/toolkit";
import axios from "axios";


export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (reqData, { rejectWithValue,getState }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.post(
        "http://localhost:4000/create-booking",reqData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "booking/verifyPayment",
  async (reqData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(
        "http://localhost:4000/verify-payment", reqData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const listBookings = createAsyncThunk(
  "booking/listBookings",
  async (_, { rejectWithValue,getState }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.get(
        "http://localhost:4000/list-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


const initialState = {
  loading: false,
  error: null,
  bookings:[],
  currentOrder:null
};

const bookingSlice = createSlice({
  name: "booking",

  initialState,

  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
  
    .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
    })

    .addCase(verifyPayment.fulfilled, (state) => {
      state.loading = false;
      state.currentOrder = null;
    })

    .addCase(listBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
    })

    // ALL PENDING REQUESTS
    .addMatcher(
    isPending(
        createBooking,
        listBookings,
        verifyPayment
    ),
    (state) => {
        state.loading = true;
        state.error = null;
    }
    )

    // ALL FAILED REQUESTS
    .addMatcher(
    isRejected(
        createBooking,
        listBookings,
        verifyPayment
    ),
    (state, action) => {
        state.loading = false;
        state.error =
        action.payload || "Something went wrong";
    }
    );
  },
});


export const { clearCurrentOrder } = bookingSlice.actions;

export default bookingSlice.reducer;