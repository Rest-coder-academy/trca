import api from "./axiosInstance";

export const getLatestBatches = async (limit = 5) => {
  const res = await api.get(`http://localhost:5000/api/batches/getbatches?limit=${limit}`);

//   console.log(res)//! Axios object with data key
//   console.log(res.data)//! res.data holding backend response object  {success: true, statusCode: 200, message: 'Batches fetched successfully', data: {…}}
//   console.log(res.data.data)//! res.data.data holding  {batches: Array(5), total: 6}
  return res.data.data; // backend returns { data }
};
