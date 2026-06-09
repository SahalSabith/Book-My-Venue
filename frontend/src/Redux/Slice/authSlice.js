import { createSlice, createAsyncThunk, isPending, isRejected } from "@reduxjs/toolkit";
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


const initialState = {
  user: null,
  resetToken: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.resetToken = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("token");
    },
  },


  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
      })


      // LOGIN
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token",action.payload.token);
      })


      // VERIFY OTP
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token",action.payload.token);
      })


      // RESEND OTP
      .addCase(resendOTP.fulfilled, (state) => {
        state.loading = false;
      })


      // FORGOT PASSWORD
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })


      // VERIFY FORGOT PASSWORD OTP
      .addCase(verifyForgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetToken = action.payload.resetToken;
      })


      // CHANGE PASSWORD
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.resetToken = null;
      })


      // GOOGLE LOGIN
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token",action.payload.token);
      })


      // ALL PENDING REQUESTS
      .addMatcher(
        isPending(
          registerUser,
          loginUser,
          verifyOTP,
          resendOTP,
          forgotPassword,
          verifyForgotPassword,
          changePassword,
          googleLogin
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )


      // ALL FAILED REQUESTS
      .addMatcher(
        isRejected(
          registerUser,
          loginUser,
          verifyOTP,
          resendOTP,
          forgotPassword,
          verifyForgotPassword,
          changePassword,
          googleLogin
        ),
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload || "Something went wrong";
        }
      );
  },
});


export const { logout } = authSlice.actions;

export default authSlice.reducer;