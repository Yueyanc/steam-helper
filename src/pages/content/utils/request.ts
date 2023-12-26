import axios from "axios";

const access_token = "ef608c2b8130e96f39629b06645d7721";
const axiosInstance = axios.create({});
axiosInstance.interceptors.request.use((config) => {
  return config;
});
axiosInstance.interceptors.response.use((response) => {
  const { data } = response;
  return data;
});
export default axiosInstance;
