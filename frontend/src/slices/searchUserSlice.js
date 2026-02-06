import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const searchUser = createAsyncThunk(
  'searchUser/fetch',
  async (keyword, thunkAPI) => {
    console.log('Thunk searchUser triggered with keyword:', keyword);
    try {
      
      const { data } = await axios.get(`/api/v1/users/search?keyword=${keyword}`);
      return data; 
    } catch (error) {
      console.log('k');
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
        
      );
    }
  }
);

const searchUserSlice = createSlice({
  name: 'searchUser',
  initialState: {
    userResults: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUserSearch: (state) => {
      state.userResults = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userResults = action.payload;
      })
      .addCase(searchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserSearch } = searchUserSlice.actions;
export default searchUserSlice.reducer;