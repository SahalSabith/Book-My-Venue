import { createSlice, createAsyncThunk, isPending, isRejected } from "@reduxjs/toolkit";
import axios from "axios";


export const createBooking = createAsyncThunk(
  "venue/createBooking",
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


const initialState = {
  loading: false,
  error: null
};

const bookingSlice = createSlice({
  name: "booking",

  initialState,

  reducers: {},
  extraReducers: (builder) => {
    builder
  
    .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
    })

    // ALL PENDING REQUESTS
    .addMatcher(
    isPending(
        createBooking
    ),
    (state) => {
        state.loading = true;
        state.error = null;
    }
    )

    // ALL FAILED REQUESTS
    .addMatcher(
    isRejected(
        createBooking
    ),
    (state, action) => {
        state.loading = false;
        state.error =
        action.payload || "Something went wrong";
    }
    );
  },
});


export const { } = bookingSlice.actions;

export default bookingSlice.reducer;