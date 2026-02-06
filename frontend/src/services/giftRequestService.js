import axios from "axios";

export const createGiftRequest = async (giftData) => {
  const res = await axios.post('/api/v1/gift-requests', giftData, {

     withCredentials: true,
  });
  return res.data;
};

