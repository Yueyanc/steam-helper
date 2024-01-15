import axios from "axios";
import fetchAdapter from "@haverstack/axios-fetch-adapter";
const axiosInstance = axios.create({
  adapter: fetchAdapter,
});
axiosInstance.interceptors.request.use((config) => {
  return config;
});
axiosInstance.interceptors.response.use((response) => {
  const { data } = response;
  return data;
});
export default axiosInstance;
