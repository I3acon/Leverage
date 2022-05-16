import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: true,
  account: "0x0",
  blanace: 0,
  auth: false,
};

const accountSlice = createSlice({
  name: "accountSlice",
  initialState,
  reducers: {
    setAccountData(state, action) {
      state.account = action.payload.account;
    },
    setBalance(state, action) {
      state.balance = action.payload.balance;
    },
    setAuth(state, action) {
      state.auth = action.payload.auth;
    },
  },
});

export const {
  setAccountData: setAccountData,
  setBalance: setBalance,
  setAuth: setAuth,
} = accountSlice.actions;
export default accountSlice.reducer;
