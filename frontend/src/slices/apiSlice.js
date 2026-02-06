import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice'; 

const baseQuery = fetchBaseQuery({ 
  baseUrl: BASE_URL, 
  credentials: 'include' 
});

const baseQueryWithAuthCheck = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log('Token expired or invalid. Logging out...');
    api.dispatch(logout()); 
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuthCheck,
  tagTypes: ['User', 'Product', 'Order'],
  endpoints: () => ({}), 
});