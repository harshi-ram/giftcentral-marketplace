import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createGiftRequest } from '../services/giftRequestService';

export const sendGiftRequest = createAsyncThunk(
  'giftRequests/send',
  async (giftData, thunkAPI) => {
    try {
      const response = await createGiftRequest(giftData);
      return response; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const giftRequestsSentSlice = createSlice({
  name: 'giftRequestsSent',
  initialState: { sent: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendGiftRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendGiftRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.sent.push(action.payload);
      })
      .addCase(sendGiftRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default giftRequestsSentSlice.reducer;
