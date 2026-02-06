import api from './api';

const updateProfile = async (userData) => {
  const res = await api.put('/users/profile', userData);
  return res.data;
};

const authService = {
  updateProfile,
};

export default authService;
