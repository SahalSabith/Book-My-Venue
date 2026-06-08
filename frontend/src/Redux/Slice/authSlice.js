import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



// REGISTER THUNK

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/register",
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data
      );
    }
  }
);




// LOGIN THUNK

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/login",
        loginData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data
      );
    }
  }
);


export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/verify-otp",
        otpData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data
      );
    }
  }
);


export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/resend-otp",
        otpData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/forgot-password",
        otpData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data
      );
    }
  }
);



export const verifyForgotPassword = createAsyncThunk(
  "auth/verifyForgotPassword",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/verify-forgotpassowrd-otp",
        otpData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data
      );
    }
  }
);


export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/change-passowrd",
        passData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response.data
      );
    }
  }
);


export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credentialResponse, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/google",
        { id_token: credentialResponse.credential }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    resetToken:null,
    token: null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(verifyForgotPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyForgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetToken = action.payload.resetToken
      })
      .addCase(verifyForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});


export const { logout } = authSlice.actions;


export default authSlice.reducer;