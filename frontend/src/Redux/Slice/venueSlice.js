import { createSlice, createAsyncThunk, isPending, isRejected } from "@reduxjs/toolkit";
import axios from "axios";


export const createVenue = createAsyncThunk(
  "venue/createVenue",
  async (reqData, { rejectWithValue,getState }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.post(
        "http://localhost:4000/create-venue",reqData,
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


export const getVenues = createAsyncThunk(
  "venue/getVenues",
  async ( _, { rejectWithValue,getState }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.get(
        "http://localhost:4000/get-venues",
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


export const venueDetail = createAsyncThunk(
  "venue/venueDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/venue-details/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const updateVenue = createAsyncThunk(
  "venue/updateVenue",
  async ( {id, fields}, { rejectWithValue,getState }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.patch(
        `http://localhost:4000/update-venue/${id}`,fields,
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

export const deleteVenue = createAsyncThunk(
  "venue/deleteVenue",
  async (id, { rejectWithValue,getState }) => {
    try {
      const token = getState().auth.token;

      const response = await axios.delete(
        `http://localhost:4000/delete-venue/${id}`,
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
  venues:[],
  venue:null,
};

const venueSlice = createSlice({
  name: "venue",

  initialState,

  reducers: {},
  extraReducers: (builder) => {
    builder
  
    .addCase(createVenue.fulfilled, (state, action) => {
        state.loading = false;
    })

    .addCase(getVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.venues = action.payload.venues
    }) 

    .addCase(venueDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.venue = action.payload.venues
        console.log(action.payload.venues)
    })

    .addCase(updateVenue.fulfilled, (state, action) => {
        state.loading = false;
    })

    .addCase(deleteVenue.fulfilled, (state, action) => {
        state.loading = false;
    })

    // ALL PENDING REQUESTS
    .addMatcher(
    isPending(
        createVenue,
        getVenues,
        venueDetail,
        updateVenue,
        deleteVenue
    ),
    (state) => {
        state.loading = true;
        state.error = null;
    }
    )

    // ALL FAILED REQUESTS
    .addMatcher(
    isRejected(
        createVenue,
        getVenues,
        venueDetail,
        updateVenue,
        deleteVenue
    ),
    (state, action) => {
        state.loading = false;
        state.error =
        action.payload || "Something went wrong";
    }
    );
  },
});


export const { } = venueSlice.actions;

export default venueSlice.reducer;