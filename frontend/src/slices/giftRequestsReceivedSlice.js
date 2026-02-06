import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchReceivedGiftRequests = createAsyncThunk(
  'giftRequests/fetchReceived',
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get('/api/v1/gift-requests/received', {
        withCredentials: true 
      });
      return data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markGiftRequestsAsRead = createAsyncThunk(
  'giftRequests/markRead',
  async (_, thunkAPI) => {
    try {
      await axios.patch('/api/v1/gift-requests/mark-read', {}, {
        withCredentials: true
      });
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const acceptGiftRequest = createAsyncThunk(
  'giftRequests/accept',
  async (id, thunkAPI) => {
    try {
      const { data } = await axios.put(
        `/api/v1/gift-requests/${id}/accept`,
        {},
        { withCredentials: true } 
      );
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const declineGiftRequest = createAsyncThunk(
  'giftRequests/decline',
  async (id, thunkAPI) => {
    try {
      const { data } = await axios.put(
        `/api/v1/gift-requests/${id}/decline`,
        {},
        { withCredentials: true } 
      );
      return data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const giftRequestsReceivedSlice = createSlice({
  name: 'giftRequests',
  initialState: { 
    received: [], 
    loading: false, 
    error: null, 
    giftRequestCount: 0 
  },
  reducers: {
    incrementGiftRequestCount: (state) => {
      state.giftRequestCount += 1;
    },
    setGiftRequestCount: (state, action) => {
      state.giftRequestCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceivedGiftRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceivedGiftRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.received = action.payload.requests;
        state.giftRequestCount = action.payload.giftRequestCount;
      })
      .addCase(fetchReceivedGiftRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markGiftRequestsAsRead.fulfilled, (state) => {
        state.giftRequestCount = 0; 
      })
      .addCase(acceptGiftRequest.fulfilled, (state, action) => {
        const idx = state.received.findIndex((r) => r._id === action.payload._id);
        if (idx > -1) state.received[idx] = action.payload;
      })
      .addCase(declineGiftRequest.fulfilled, (state, action) => {
        state.received = state.received.filter((r) => r._id !== action.payload.id);
      });
  }
});

export const { incrementGiftRequestCount, setGiftRequestCount } = giftRequestsReceivedSlice.actions;
export default giftRequestsReceivedSlice.reducer;
