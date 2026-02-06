import axios from 'axios';

export const getUserById = async (id) => {
  const { data } = await axios.get(`/api/v1/users/${id}`);
  return data;
};


export const getUserProfile = async () => {
  const res = await axios.get('/api/v1/users/profile', {
    withCredentials: true,
  });

  console.log("getUserProfile response", res.data);
  return res.data;
};



export const getUserByName = async (name) => {
  const { data } = await axios.get(`/api/v1/users/name/${name}`);
  return data;
};

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    '/api/v1/users/profile/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true, 
    }
  );
  return response.data;
};

export const deleteProfilePicture = async () => {
  const response = await axios.delete(
    '/api/v1/users/profile/remove',
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export const updateUserBio = async (bio) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  };

  const response = await axios.put('/api/v1/users/update-bio', { bio }, config);
  return response.data;
};