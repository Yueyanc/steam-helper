import axios from "axios";

const axiosInstance = axios.create({});
axiosInstance.interceptors.request.use((config) => {
  return config;
});
axiosInstance.interceptors.response.use((response) => {
  const { data } = response;
  return data;
});
export default axiosInstance;
